'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { logger } from '@/lib/logger';
import { useCurrentRoute } from '@/stores/uiStore';
import { useUserProfile } from '@/stores/userStore';
import {
  CollaborationMessage,
  ConnectionStatus,
  PresenceIndicator,
  CollaborationConflict,
  UseRealtimeCollabReturn,
  WebSocketConfig,
  PresenceMessage,
  StoryUpdateMessage,
  CursorMoveMessage,
  ConflictResolutionMessage,
  HeartbeatMessage,
} from '@/types/collaboration';

// Default WebSocket configuration
const DEFAULT_CONFIG: WebSocketConfig = {
  url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001',
  reconnectInterval: 5000,
  heartbeatInterval: 30000,
  maxReconnectAttempts: 10,
  offlineTimeout: 60000,
};

interface UseRealtimeCollabProps {
  storyId?: string;
  onStoryUpdate?: (update: Record<string, unknown>) => void;
  config?: Partial<WebSocketConfig>;
}

export function useRealtimeCollab({
  storyId,
  onStoryUpdate,
  config: userConfig = {},
}: UseRealtimeCollabProps): UseRealtimeCollabReturn {
  // Merge user config with defaults
  const config = useMemo(() => ({ ...DEFAULT_CONFIG, ...userConfig }), [userConfig]);

  // State
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [presence, setPresence] = useState<Map<string, PresenceIndicator>>(new Map());
  const [conflicts, setConflicts] = useState<CollaborationConflict[]>([]);
  const [lastError, setLastError] = useState<Error | null>(null);

  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  // Store hooks
  const user = useUserProfile();
  const currentRoute = useCurrentRoute();

  // Derived state
  const isConnected = connectionStatus === 'connected';
  const isConnecting = connectionStatus === 'connecting';
  const isReconnecting = connectionStatus === 'reconnecting';

  const onlineUsers = Array.from(presence.values()).filter(user => user.isOnline);
  const offlineUsers = Array.from(presence.values()).filter(user => !user.isOnline);
  const allUsers = Array.from(presence.values());

  // Clear error
  const clearError = useCallback(() => {
    setLastError(null);
  }, []);

  // Handle presence updates
  const handlePresenceUpdate = useCallback((message: PresenceMessage) => {
    const { userId, userName, userAvatar, data } = message;

    setPresence(prev => {
      const newPresence = new Map(prev);
      newPresence.set(userId, {
        userId,
        userName,
        userAvatar,
        lastSeen: new Date(),
        currentAction: data.action,
        isOnline: true,
      });
      return newPresence;
    });
  }, []);

  // Handle story updates
  const handleStoryUpdate = useCallback(
    (message: StoryUpdateMessage) => {
      if (onStoryUpdate) {
        onStoryUpdate(message.data.changes);
      }
    },
    [onStoryUpdate]
  );

  // Handle cursor movements
  const handleCursorMove = useCallback((message: CursorMoveMessage) => {
    const { userId, data } = message;

    setPresence(prev => {
      const newPresence = new Map(prev);
      const user = newPresence.get(userId);
      if (user) {
        newPresence.set(userId, {
          ...user,
          cursorPosition: data.position,
          lastSeen: new Date(),
        });
      }
      return newPresence;
    });
  }, []);

  // Handle conflict resolution
  const handleConflictResolution = useCallback(
    (message: ConflictResolutionMessage) => {
      setConflicts(prev => prev.filter(c => c.id !== message.data.conflictId));
    },
    []
  );

  // Handle incoming messages
  const handleMessage = useCallback(
    (message: CollaborationMessage) => {
      try {
        switch (message.type) {
          case 'presence':
            handlePresenceUpdate(message as PresenceMessage);
            break;
          case 'story_update':
            handleStoryUpdate(message as StoryUpdateMessage);
            break;
          case 'cursor_move':
            handleCursorMove(message as CursorMoveMessage);
            break;
          case 'conflict_resolution':
            handleConflictResolution(message as ConflictResolutionMessage);
            break;
          case 'heartbeat':
            // Heartbeat received, no action needed
            break;
          default:
            logger.warn('Unknown message type:', { type: (message as any).type });
        }
      } catch (error) {
        logger.error('Error handling collaboration message:', error as Error);
        setLastError(error as Error);
      }
    },
    [handlePresenceUpdate, handleStoryUpdate, handleCursorMove, handleConflictResolution]
  );

  // Send message to WebSocket
  const sendMessage = useCallback(
    (message: CollaborationMessage | Record<string, unknown>) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        try {
          wsRef.current.send(JSON.stringify(message));
        } catch (error) {
          logger.error('Failed to send WebSocket message:', error as Error);
          setLastError(error as Error);
        }
      } else {
        logger.warn('WebSocket not connected, cannot send message:', message);
      }
    },
    []
  );

  // Send presence update
  const sendPresenceUpdate = useCallback(
    (action: 'viewing' | 'editing' | 'idle' | 'away') => {
      if (!user) return;

      const message: PresenceMessage = {
        type: 'presence',
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        timestamp: Date.now(),
        data: {
          action,
          storyId,
          route: currentRoute,
        },
      };

      sendMessage(message);
    },
    [user, storyId, currentRoute, sendMessage]
  );

  // Send story update
  const sendUpdate = useCallback(
    (data: Record<string, unknown>) => {
      if (!user || !storyId) return;

      const message: StoryUpdateMessage = {
        type: 'story_update',
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        timestamp: Date.now(),
        data: {
          storyId,
          changes: data,
          version: Date.now(), // Simple versioning
        },
      };

      sendMessage(message);
    },
    [user, storyId, sendMessage]
  );

  // Send cursor move
  const sendCursorMove = useCallback(
    (position: { x: number; y: number }) => {
      if (!user) return;

      const message: CursorMoveMessage = {
        type: 'cursor_move',
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        timestamp: Date.now(),
        data: {
          position,
          storyId,
        },
      };

      sendMessage(message);
    },
    [user, storyId, sendMessage]
  );

  // Resolve conflict
  const resolveConflict = useCallback(
    (conflictId: string, resolution: 'accepted' | 'rejected' | 'merged') => {
      if (!user) return;

      const message: ConflictResolutionMessage = {
        type: 'conflict_resolution',
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        timestamp: Date.now(),
        data: {
          conflictId,
          resolution,
        },
      };

      sendMessage(message);
    },
    [user, sendMessage]
  );

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    try {
      setConnectionStatus('connecting');
      setLastError(null);

      const ws = new WebSocket(`${config.url}/collaboration`);

      ws.onopen = () => {
        setConnectionStatus('connected');
        reconnectAttemptsRef.current = 0;
        logger.info('WebSocket connected');

        // Send initial presence update
        if (user) {
          sendPresenceUpdate('viewing');
        }

        // Start heartbeat
        heartbeatIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            const heartbeat: HeartbeatMessage = {
              type: 'heartbeat',
              userId: user?.id || 'anonymous',
              userName: user?.name || 'Anonymous',
              userAvatar: user?.avatar,
              timestamp: Date.now(),
              data: {},
            };
            sendMessage(heartbeat);
          }
        }, config.heartbeatInterval);
      };

      ws.onmessage = event => {
        try {
          const message: CollaborationMessage = JSON.parse(event.data);
          handleMessage(message);
        } catch (error) {
          logger.error('Failed to parse WebSocket message:', error as Error);
          setLastError(error as Error);
        }
      };

      ws.onclose = () => {
        setConnectionStatus('disconnected');
        logger.info('WebSocket disconnected');

        // Clear heartbeat
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
        }

        // Attempt to reconnect if we haven't exceeded max attempts
        if (reconnectAttemptsRef.current < config.maxReconnectAttempts) {
          setConnectionStatus('reconnecting');
          reconnectAttemptsRef.current += 1;
          
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, config.reconnectInterval);
        } else {
          logger.error('Max reconnection attempts reached');
          setLastError(new Error('Max reconnection attempts reached'));
        }
      };

      ws.onerror = error => {
        logger.error('WebSocket error:', error as unknown as Error);
        setConnectionStatus('disconnected');
        setLastError(error as unknown as Error);
      };

      wsRef.current = ws;
    } catch (error) {
      logger.error('Failed to create WebSocket connection:', error as Error);
      setConnectionStatus('disconnected');
      setLastError(error as Error);
    }
  }, [config, user, sendPresenceUpdate, sendMessage, handleMessage]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    setConnectionStatus('disconnected');
    reconnectAttemptsRef.current = 0;
  }, []);

  // Reconnect manually
  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttemptsRef.current = 0;
    connect();
  }, [disconnect, connect]);

  // Clean up offline users
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setPresence(prev => {
        const newPresence = new Map(prev);
        for (const [userId, user] of newPresence) {
          if (now.getTime() - user.lastSeen.getTime() > config.offlineTimeout) {
            newPresence.set(userId, { ...user, isOnline: false });
          }
        }
        return newPresence;
      });
    }, config.offlineTimeout / 2); // Check every half the timeout period

    return () => clearInterval(interval);
  }, [config.offlineTimeout]);

  // Connect on mount
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Update presence when route changes
  useEffect(() => {
    if (isConnected) {
      sendPresenceUpdate('viewing');
    }
  }, [currentRoute, isConnected, sendPresenceUpdate]);

  // Update presence when story changes
  useEffect(() => {
    if (isConnected && storyId) {
      sendPresenceUpdate('editing');
    }
  }, [storyId, isConnected, sendPresenceUpdate]);

  return {
    // Connection state
    connectionStatus,
    isConnected,
    isConnecting,
    isReconnecting,

    // User presence
    onlineUsers,
    offlineUsers,
    allUsers,

    // Conflicts
    conflicts,

    // Actions
    sendUpdate,
    sendPresenceUpdate,
    sendCursorMove,
    resolveConflict,

    // Connection management
    connect,
    disconnect,
    reconnect,

    // Error handling
    lastError,
    clearError,
  };
}
