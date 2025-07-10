export interface Comment {
  userId: Author | string;
  comment: string;
  commentedAt: string;
}

export interface Reactions {
  like: number;
  love: number;
  laugh: number;
  angry?: number;
  sad?: number;
}

export interface Author {
  _id: string;
  firstName: string;
  lastName: string;
}

export interface Post {
  _id: string;
  title: string;
  authorId: Author | string;
  content: string;
  postType: 'text' | 'invoice' | 'experience' | 'general' | 'financial' | 'question' | 'announcement';
  invoiceId?: string;
  images: string[];
  imageUrls?: string[];
  imageUrl?: string; // Campo temporal para el formulario
  description?: string;
  maxComments?: number;
  reactions: Reactions;
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface PostResponse {
  success: boolean;
  data: Post[];
} 