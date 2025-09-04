'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Users, Wifi, WifiOff, Circle } from 'lucide-react';
import React, { useState, useEffect, useCallback, useRef } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { logger } from '@/lib/logger';
import { cn } from '@/lib/utils';
import { useCurrentRoute } from '@/stores/uiStore';
import { useUserProfile } from '@/stores/userStore';

interface CollaborationMessage {
  type: 'story_update' | 'presence' | 'cursor_move' | 'conflict_resolution';
  userId: string;
  userName: string;
  userAvatar?: string;
  timestamp: number;
  data: any;
}

interface PresenceIndicator {
  userId: string;
  userName: string;
  userAvatar?: string;
  lastSeen: Date;
  currentAction: string;
  isOnline: boolean;
  cursorPosition?: { x: number; y: number };
}

interface RealTimeCollaborationProps {
  storyId?: string;
  onStoryUpdate?: (update: any) => void;
  className?: string;
}

export function RealTimeCollaboration({
  storyId,
  onStoryUpdate,
  className = '',
}: RealTimeCollaborationProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [presence, setPresence] = useState<Map<string, PresenceIndicator>>(
    new Map()
  );

  const [isExpanded, setIsExpanded] = useState(false);
  const [conflicts, setConflicts] = useState<any[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const user = useUserProfile();
  const currentRoute = useCurrentRoute();

  // Initialize WebSocket connection
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
      const ws = new WebSocket(`${wsUrl}/collaboration`);

      ws.onopen = () => {
        setIsConnected(true);
        logger.info('WebSocket connected');

        // Send presence update
        if (user) {
          ws.send(
            JSON.stringify({
              type: 'presence',
              userId: user.id,
              userName: user.name,
              userAvatar: user.avatar,
              storyId,
              route: currentRoute,
              action: 'viewing',
            })
          );
        }

        // Start heartbeat
        heartbeatIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'heartbeat' }));
          }
        }, 30000); // 30 seconds
      };

      ws.onmessage = event => {
        try {
          const message: CollaborationMessage = JSON.parse(event.data);
          handleMessage(message);
        } catch (error) {
          logger.error('Failed to parse WebSocket message:', error as Error);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        logger.info('WebSocket disconnected');

        // Attempt to reconnect
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, 5000);
      };

      ws.onerror = error => {
        logger.error('WebSocket error:', error as unknown as Error);
        setIsConnected(false);
      };

      wsRef.current = ws;
    } catch (error) {
      logger.error('Failed to create WebSocket connection:', error as Error);
    }
  }, [user, storyId, currentRoute]);

  // Handle incoming messages
  const handleMessage = useCallback((message: CollaborationMessage) => {
    switch (message.type) {
      case 'presence':
        handlePresenceUpdate(message);
        break;
      case 'story_update':
        handleStoryUpdate(message);
        break;
      case 'cursor_move':
        handleCursorMove(message);
        break;
      case 'conflict_resolution':
        handleConflictResolution(message);
        break;
      default:
        logger.warn('Unknown message type:', { type: message.type });
    }
  }, []);

  // Handle presence updates
  const handlePresenceUpdate = useCallback((message: CollaborationMessage) => {
    const { userId, userName, userAvatar, data } = message;

    setPresence(prev => {
      const newPresence = new Map(prev);
      newPresence.set(userId, {
        userId,
        userName,
        userAvatar,
        lastSeen: new Date(),
        currentAction: data?.action || 'viewing',
        isOnline: true,
      });
      return newPresence;
    });
  }, []);

  // Handle story updates
  const handleStoryUpdate = useCallback(
    (message: CollaborationMessage) => {
      if (onStoryUpdate) {
        onStoryUpdate(message.data);
      }
    },
    [onStoryUpdate]
  );

  // Handle cursor movements
  const handleCursorMove = useCallback((message: CollaborationMessage) => {
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
    (message: CollaborationMessage) => {
      setConflicts(prev => prev.filter(c => c.id !== message.data.conflictId));
    },
    []
  );

  // Update presence
  const updatePresence = useCallback(
    (action: string) => {
      if (wsRef.current?.readyState === WebSocket.OPEN && user) {
        wsRef.current.send(
          JSON.stringify({
            type: 'presence',
            userId: user.id,
            userName: user.name,
            userAvatar: user.avatar,
            storyId,
            route: currentRoute,
            action,
          })
        );
      }
    },
    [user, storyId, currentRoute]
  );

  // Clean up offline users
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setPresence(prev => {
        const newPresence = new Map(prev);
        for (const [userId, user] of newPresence) {
          if (now.getTime() - user.lastSeen.getTime() > 60000) {
            // 1 minute
            newPresence.set(userId, { ...user, isOnline: false });
          }
        }
        return newPresence;
      });
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Connect on mount
  useEffect(() => {
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
    };
  }, [connectWebSocket]);

  // Update presence when route changes
  useEffect(() => {
    if (isConnected) {
      updatePresence('viewing');
    }
  }, [currentRoute, isConnected, updatePresence]);

  // Update presence when story changes
  useEffect(() => {
    if (isConnected && storyId) {
      updatePresence('editing');
    }
  }, [storyId, isConnected, updatePresence]);

  const onlineUsers = Array.from(presence.values()).filter(
    user => user.isOnline
  );
  const offlineUsers = Array.from(presence.values()).filter(
    user => !user.isOnline
  );

  return (
    <div className={cn('relative', className)}>
      {/* Presence Indicator */}
      <Button
        variant='outline'
        size='sm'
        onClick={() => setIsExpanded(!isExpanded)}
        className='relative'
      >
        <Users className='w-4 h-4 mr-2' />
        <span className='hidden sm:inline'>همکاری</span>

        {/* Online indicator */}
        <div className='absolute -top-1 -right-1'>
          <Circle
            className={cn(
              'w-3 h-3',
              isConnected ? 'text-green-500 fill-green-500' : 'text-gray-400'
            )}
          />
        </div>

        {/* User count badge */}
        {onlineUsers.length > 0 && (
          <Badge variant='secondary' className='ml-2'>
            {onlineUsers.length}
          </Badge>
        )}
      </Button>

      {/* Expanded Collaboration Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className='absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50'
          >
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='text-sm flex items-center gap-2'>
                  <Wifi
                    className={cn(
                      'w-4 h-4',
                      isConnected ? 'text-green-500' : 'text-red-500'
                    )}
                  />
                  {isConnected ? 'متصل' : 'قطع اتصال'}
                </CardTitle>
              </CardHeader>

              <CardContent className='space-y-4'>
                {/* Online Users */}
                <div>
                  <h4 className='text-sm font-medium mb-2 text-gray-700 dark:text-gray-300'>
                    کاربران آنلاین ({onlineUsers.length})
                  </h4>
                  <div className='space-y-2'>
                    {onlineUsers.map(user => (
                      <div
                        key={user.userId}
                        className='flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-md'
                      >
                        <Avatar className='w-6 h-6'>
                          <AvatarImage src={user.userAvatar} />
                          <AvatarFallback className='text-xs'>
                            {user.userName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className='text-sm text-gray-700 dark:text-gray-300'>
                          {user.userName}
                        </span>
                        <Badge variant='outline' className='text-xs'>
                          {user.currentAction}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Offline Users */}
                {offlineUsers.length > 0 && (
                  <div>
                    <h4 className='text-sm font-medium mb-2 text-gray-700 dark:text-gray-300'>
                      کاربران آفلاین ({offlineUsers.length})
                    </h4>
                    <div className='space-y-2'>
                      {offlineUsers.map(user => (
                        <div
                          key={user.userId}
                          className='flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md opacity-60'
                        >
                          <Avatar className='w-6 h-6'>
                            <AvatarImage src={user.userAvatar} />
                            <AvatarFallback className='text-xs'>
                              {user.userName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className='text-sm text-gray-700 dark:text-gray-300'>
                            {user.userName}
                          </span>
                          <WifiOff className='w-3 h-3 text-gray-400' />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Conflicts */}
                {conflicts.length > 0 && (
                  <div>
                    <h4 className='text-sm font-medium mb-2 text-red-700 dark:text-red-300'>
                      تعارضات ({conflicts.length})
                    </h4>
                    <div className='space-y-2'>
                      {conflicts.map(conflict => (
                        <div
                          key={conflict.id}
                          className='p-2 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800'
                        >
                          <p className='text-sm text-red-700 dark:text-red-300'>
                            {conflict.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Connection Status */}
                <div className='pt-2 border-t border-gray-200 dark:border-gray-700'>
                  <div className='flex items-center justify-between text-xs text-gray-500 dark:text-gray-400'>
                    <span>وضعیت اتصال:</span>
                    <span
                      className={cn(
                        'px-2 py-1 rounded-full',
                        isConnected
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                      )}
                    >
                      {isConnected ? 'متصل' : 'قطع اتصال'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
