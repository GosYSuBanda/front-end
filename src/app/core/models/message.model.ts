import { MediaFile } from './post.model';
import { ParticipantRole } from './ui.types';

// Message Types
export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'file' | 'location' | 'contact' | 'system';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface MessageMedia {
  _id: string;
  type: 'image' | 'video' | 'audio' | 'file';
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  thumbnail?: string;
  duration?: number; // for audio/video
  dimensions?: {
    width: number;
    height: number;
  };
}

export interface Conversation {
  _id: string;
  type: 'private' | 'group';
  name?: string;
  description?: string;
  avatar?: string;
  participants: ConversationParticipant[];
  admins: string[];
  lastMessage?: Message;
  lastActivity: string;
  isArchived: boolean;
  isPinned: boolean;
  settings: ConversationSettings;
  metadata: ConversationMetadata;
  createdAt: string;
  updatedAt: string;
  // Add missing properties for template compatibility
  isGroup: boolean;
  unreadCount: number;
}

export interface ConversationParticipant {
  _id: string;
  name: string;
  profilePicture?: string;
  role: ParticipantRole;
  joinedAt: string;
  lastSeen?: string;
  permissions?: string[];
  isOnline?: boolean;
  status?: 'active' | 'away' | 'busy' | 'offline';
}

export interface ParticipantPermissions {
  canSendMessages: boolean;
  canSendMedia: boolean;
  canAddMembers: boolean;
  canRemoveMembers: boolean;
  canChangeSettings: boolean;
  canDeleteMessages: boolean;
}

export interface ConversationSettings {
  isPublic: boolean;
  allowInvites: boolean;
  allowMemberAdd: boolean;
  allowMemberRemove: boolean;
  allowNameChange: boolean;
  allowAvatarChange: boolean;
  messageRetention: number; // days
  autoDeleteAfter?: number; // days
}

export interface ConversationMetadata {
  totalMessages: number;
  totalMedia: number;
  totalMembers: number;
  createdBy: string;
  lastMessageAt?: string;
  tags?: string[];
  category?: string;
}

export interface Message {
  _id: string;
  conversation: string;
  sender: string;
  content: string;
  type: MessageType;
  status: MessageStatus;
  createdAt: string;
  updatedAt: string;
  readBy: MessageRead[];
  reactions: MessageReaction[];
  media?: MessageMedia[];
  metadata?: MessageMetadata;
  editedAt?: string;
  editHistory?: MessageEdit[];
  parentMessage?: string;
  mentions?: string[];
  // Add author property for template compatibility
  author: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
}

export interface MessageReaction {
  _id: string;
  user: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  emoji: string;
  createdAt: string;
}

export interface MessageRead {
  user: string;
  readAt: string;
}

export interface MessageDelivered {
  user: string;
  deliveredAt: string;
}

export interface MessageEdit {
  editedAt: string;
  previousContent: string;
  reason?: string;
}

export interface MessageMetadata {
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  expiresAt?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  contact?: {
    name: string;
    phone?: string;
    email?: string;
  };
  systemInfo?: {
    action: string;
    details?: any;
  };
}

export interface CreateConversationRequest {
  type: 'private' | 'group';
  participants: string[];
  name?: string;
  description?: string;
  avatar?: File;
  settings?: Partial<ConversationSettings>;
}

export interface UpdateConversationRequest {
  name?: string;
  description?: string;
  avatar?: File;
  settings?: Partial<ConversationSettings>;
}

export interface SendMessageRequest {
  conversationId: string;
  type: Message['type'];
  content: string;
  media?: File[];
  replyTo?: string;
  metadata?: Partial<MessageMetadata>;
}

export interface ConversationFilters {
  type?: Conversation['type'];
  isArchived?: boolean;
  isPinned?: boolean;
  hasUnread?: boolean;
  participantId?: string;
  search?: string;
  limit?: number;
  page?: number;
  sortBy?: 'lastActivity' | 'name' | 'created' | 'unread';
}

export interface MessageFilters {
  conversationId: string;
  type?: Message['type'];
  sender?: string;
  hasMedia?: boolean;
  dateRange?: {
    start?: string;
    end?: string;
  };
  search?: string;
  limit?: number;
  page?: number;
  before?: string; // message ID for pagination
  after?: string; // message ID for pagination
}

export interface ConversationStats {
  totalMessages: number;
  totalMedia: number;
  totalMembers: number;
  averageResponseTime: number;
  mostActiveMembers: Array<{
    user: {
      _id: string;
      name: string;
      profilePicture?: string;
    };
    messageCount: number;
    lastActivity: string;
  }>;
  messagesByType: { [key: string]: number };
  messagesByDay: Array<{
    date: string;
    count: number;
  }>;
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
  timestamp: string;
}

export interface ConversationPreview {
  conversation: Conversation;
  unreadCount: number;
  lastMessage?: Message;
  typingUsers: string[];
  isOnline: boolean;
}

export interface MessageStatusUpdate {
  messageId: string;
  status: MessageStatus;
  timestamp: string;
} 