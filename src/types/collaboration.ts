// ============================================================================
// COLLABORATION TYPES
// ============================================================================

// Base message structure
export interface BaseCollaborationMessage {
  type: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  timestamp: number;
}

// Specific message types
export interface PresenceMessage extends BaseCollaborationMessage {
  type: 'presence';
  data: {
    action: 'viewing' | 'editing' | 'idle' | 'away';
    storyId?: string;
    route?: string;
  };
}

export interface StoryUpdateMessage extends BaseCollaborationMessage {
  type: 'story_update';
  data: {
    storyId: string;
    changes: Record<string, unknown>;
    version: number;
  };
}

export interface CursorMoveMessage extends BaseCollaborationMessage {
  type: 'cursor_move';
  data: {
    position: {
      x: number;
      y: number;
    };
    storyId?: string;
  };
}

export interface ConflictResolutionMessage extends BaseCollaborationMessage {
  type: 'conflict_resolution';
  data: {
    conflictId: string;
    resolution: 'accepted' | 'rejected' | 'merged';
  };
}

export interface HeartbeatMessage extends BaseCollaborationMessage {
  type: 'heartbeat';
  data: Record<string, never>;
}

// Union type for all possible messages
export type CollaborationMessage = 
  | PresenceMessage
  | StoryUpdateMessage
  | CursorMoveMessage
  | ConflictResolutionMessage
  | HeartbeatMessage;

// Presence and user state
export interface PresenceIndicator {
  userId: string;
  userName: string;
  userAvatar?: string;
  lastSeen: Date;
  currentAction: 'viewing' | 'editing' | 'idle' | 'away';
  isOnline: boolean;
  cursorPosition?: {
    x: number;
    y: number;
  };
}

// Conflict management
export interface CollaborationConflict {
  id: string;
  message: string;
  type: 'edit_conflict' | 'version_conflict' | 'permission_conflict';
  severity: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
}

// Connection status
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

// WebSocket configuration
export interface WebSocketConfig {
  url: string;
  reconnectInterval: number;
  heartbeatInterval: number;
  maxReconnectAttempts: number;
  offlineTimeout: number;
}

// Hook return type
export interface UseRealtimeCollabReturn {
  // Connection state
  connectionStatus: ConnectionStatus;
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
  
  // User presence
  onlineUsers: PresenceIndicator[];
  offlineUsers: PresenceIndicator[];
  allUsers: PresenceIndicator[];
  
  // Conflicts
  conflicts: CollaborationConflict[];
  
  // Actions
  sendUpdate: (data: Record<string, unknown>) => void;
  sendPresenceUpdate: (action: 'viewing' | 'editing' | 'idle' | 'away') => void;
  sendCursorMove: (position: { x: number; y: number }) => void;
  resolveConflict: (conflictId: string, resolution: 'accepted' | 'rejected' | 'merged') => void;
  
  // Connection management
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
  
  // Error handling
  lastError: Error | null;
  clearError: () => void;
}

// Component props
export interface RealTimeCollaborationProps {
  storyId?: string;
  onStoryUpdate?: (update: Record<string, unknown>) => void;
  className?: string;
  config?: Partial<WebSocketConfig>;
}

// UI component props
export interface PresenceIndicatorProps {
  users: PresenceIndicator[];
  isExpanded: boolean;
  onToggle: () => void;
  className?: string;
}

export interface OnlineUsersListProps {
  users: PresenceIndicator[];
  className?: string;
}

export interface OfflineUsersListProps {
  users: PresenceIndicator[];
  className?: string;
}

export interface ConflictsListProps {
  conflicts: CollaborationConflict[];
  onResolve: (conflictId: string, resolution: 'accepted' | 'rejected' | 'merged') => void;
  className?: string;
}

export interface ConnectionStatusProps {
  status: ConnectionStatus;
  className?: string;
}
