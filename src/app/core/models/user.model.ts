export type LanguageCode = 'es' | 'en' | 'pt' | 'fr';
export type ThemePreference = 'light' | 'dark' | 'auto';

// Base user type for compatibility across components
export interface BaseUser {
  _id: string;
  name: string;
  profilePicture?: string;
  isVerified?: boolean;
  email?: string;
  bio?: string;
}

// Type for basic user display (avatars, cards, etc.)
export type DisplayUser = BaseUser;

export interface User {
  _id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  coverPicture?: string;
  bio?: string;
  location?: string;
  website?: string;
  birthDate?: string;
  phoneNumber?: string;
  isVerified: boolean;
  isActive: boolean;
  roles: Role[] | string[];
  followers: string[];
  following: string[];
  preferences: UserPreferences;
  businessInfo?: BusinessInfo;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  _id: string;
  name: string;
  description?: string;
  permissions: string[];
}

export interface UserPreferences {
  language?: LanguageCode | string;
  timezone?: string;
  notifications?: NotificationPreferences | boolean;
  privacy?: PrivacyPreferences;
  theme?: ThemePreference | string;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  privacyLevel?: 'public' | 'private' | 'friends';
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  comments: boolean;
  likes: boolean;
  follows: boolean;
  messages: boolean;
}

export interface PrivacyPreferences {
  profileVisibility: 'public' | 'private' | 'friends';
  showEmail: boolean;
  showPhone: boolean;
  showLocation: boolean;
  allowMessagesFrom: 'everyone' | 'following' | 'followers' | 'none';
}

export interface BusinessInfo {
  companyName: string;
  position: string;
  industry: string;
  website: string;
  description: string;
  verified?: boolean;
  employees?: number;
  location?: string;
  founded?: Date;
}

export interface UserMetrics {
  totalPosts: number;
  totalLikes: number;
  totalViews: number;
  totalShares: number;
  totalComments: number;
  engagementRate: number;
  profileViews: number;
  lastActive: Date;
  joinDate: Date;
  averageResponseTime?: number;
  topTags?: string[];
}

export interface UserSearchFilters {
  query?: string;
  location?: string;
  sector?: string;
  companySize?: string;
  isVerified?: boolean;
  hasBusinessInfo?: boolean;
  minFollowers?: number;
  maxFollowers?: number;
  sortBy?: 'relevance' | 'followers' | 'recent' | 'alphabetical';
  limit?: number;
  page?: number;
}

export interface UserSuggestion {
  user: User;
  reason: 'mutual_friends' | 'same_location' | 'same_sector' | 'trending' | 'new_user';
  mutualFriends?: number;
  commonInterests?: string[];
  score: number;
} 