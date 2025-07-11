// Export all models
export * from './auth.model';
export * from './api-response.model';
export * from './user.model';
export * from './post.model';
export * from './message.model';
export * from './ui.types';

// Common Types
export type ID = string;
export type Timestamp = string;
export type Email = string;
export type URL = string;

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredField<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Enum Types
export enum UserRole {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  USER = 'user',
  BUSINESS = 'business'
}

export enum PostType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  LINK = 'link',
  POLL = 'poll',
  EVENT = 'event',
  JOB = 'job',
  INVOICE = 'invoice',
  EXPERIENCE = 'experience'
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  FILE = 'file',
  LOCATION = 'location',
  CONTACT = 'contact',
  SYSTEM = 'system'
}

export enum ReactionType {
  LIKE = 'like',
  LOVE = 'love',
  LAUGH = 'laugh',
  WOW = 'wow',
  SAD = 'sad',
  ANGRY = 'angry',
  SUPPORT = 'support',
  CELEBRATE = 'celebrate'
}

export enum ConversationType {
  PRIVATE = 'private',
  GROUP = 'group'
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  AUTO = 'auto'
}

// Enums para tamaños de componentes - moved to ui.types.ts
export type LoadingSpinnerSize = 'small' | 'medium' | 'large';

// Tipos para tabs
export type ProfileTab = 'metrics' | 'posts' | 'about' | 'connections'; 