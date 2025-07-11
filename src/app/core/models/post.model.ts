export interface Post {
  _id: string;
  author: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
    isVerified: boolean;
    businessInfo?: {
      companyName: string;
      logo?: string;
      sector?: string;
    };
  };
  content: string;
  type: 'text' | 'image' | 'video' | 'link' | 'poll' | 'event' | 'job' | 'invoice' | 'experience';
  category?: 'general' | 'business' | 'technology' | 'finance' | 'marketing' | 'education' | 'networking';
  tags: string[];
  media: MediaFile[];
  reactions: PostReaction[];
  comments: PostComment[];
  shares: PostShare[];
  views: number;
  isPublic: boolean;
  isPinned: boolean;
  businessInfo?: BusinessPostInfo;
  location?: PostLocation;
  metadata?: PostMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface MediaFile {
  _id: string;
  url: string;
  publicId: string;
  filename: string;
  mimetype: string;
  size: number;
  width?: number;
  height?: number;
  duration?: number;
  thumbnail?: string;
  uploadedAt: string;
}

export interface PostReaction {
  _id: string;
  user: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  type: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry' | 'support' | 'celebrate';
  createdAt: string;
}

export interface PostComment {
  _id: string;
  author: {
    _id: string;
    name: string;
    profilePicture?: string;
    isVerified: boolean;
  };
  content: string;
  media?: MediaFile[];
  reactions: PostReaction[];
  replies: PostComment[];
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PostShare {
  _id: string;
  user: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  comment?: string;
  createdAt: string;
}

export interface BusinessPostInfo {
  companyName: string;
  ruc?: string;
  sector?: string;
  invoiceNumber?: string;
  amount?: number;
  currency?: string;
  dueDate?: string;
  status?: 'pending' | 'paid' | 'overdue' | 'cancelled';
  clientInfo?: {
    name: string;
    email?: string;
    phone?: string;
  };
  services?: Array<{
    description: string;
    quantity: number;
    price: number;
    total: number;
  }>;
}

export interface PostLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
  address?: string;
  city?: string;
  country?: string;
}

export interface PostMetadata {
  editHistory?: Array<{
    editedAt: string;
    previousContent?: string;
    reason?: string;
  }>;
  moderationFlags?: Array<{
    reason: string;
    flaggedBy: string;
    flaggedAt: string;
    status: 'pending' | 'resolved' | 'dismissed';
  }>;
  analytics?: {
    impressions: number;
    reach: number;
    engagement: number;
    clicks: number;
    saves: number;
  };
}

export interface CreatePostRequest {
  content: string;
  type: Post['type'];
  category?: Post['category'];
  tags?: string[];
  media?: File[];
  isPublic?: boolean;
  businessInfo?: Partial<BusinessPostInfo>;
  location?: Partial<PostLocation>;
}

export interface UpdatePostRequest {
  content?: string;
  tags?: string[];
  category?: Post['category'];
  isPublic?: boolean;
  isPinned?: boolean;
}

export interface PostFilters {
  type?: Post['type'];
  category?: Post['category'];
  author?: string;
  tags?: string[];
  hasMedia?: boolean;
  isPublic?: boolean;
  location?: {
    near?: [number, number];
    radius?: number;
  };
  dateRange?: {
    start?: string;
    end?: string;
  };
  sortBy?: 'newest' | 'oldest' | 'trending' | 'popular' | 'relevant';
  limit?: number;
  page?: number;
}

export interface BusinessPostFilters extends PostFilters {
  companyName?: string;
  ruc?: string;
  sector?: string;
  invoiceStatus?: BusinessPostInfo['status'];
  amountRange?: {
    min?: number;
    max?: number;
  };
  currency?: string;
}

export interface FeedType {
  type: 'following' | 'discover' | 'trending' | 'business' | 'saved';
  filters?: PostFilters;
}

export interface PostStats {
  totalReactions: number;
  totalComments: number;
  totalShares: number;
  views: number;
  engagementRate: number;
  reactionBreakdown: { [key: string]: number };
  topComments: PostComment[];
}

export interface TrendingPost extends Post {
  trendingScore: number;
  trendingReason: string;
  growthRate: number;
} 