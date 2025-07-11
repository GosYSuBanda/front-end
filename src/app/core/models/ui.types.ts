// UI Component Types
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'small' | 'large';
export type LoadingSpinnerSize = 'sm' | 'md' | 'lg';

// Business Types
export type FeedFilter = 'following' | 'discover' | 'trending' | 'business' | 'saved';
export type MessageFilter = 'all' | 'unread' | 'groups' | 'direct';
export type SearchType = 'all' | 'users' | 'posts' | 'companies';

// Role Types
export enum ParticipantRole {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  MEMBER = 'member'
}

// Form Types
export interface FilterChangeEvent {
  filter: FeedFilter;
}

export interface PostCreatedEvent {
  post: any;
}

export interface PostUpdatedEvent {
  post: any;
}

export interface PostDeletedEvent {
  postId: string;
}

export interface SidebarToggleEvent {
  collapsed: boolean;
} 