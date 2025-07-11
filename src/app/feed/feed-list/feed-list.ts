import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostFactura } from '../components/post-factura/post-factura';
import { PostExperiencia } from '../components/post-experiencia/post-experiencia';
import { PostService } from '../../core/services/post.service';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-feed-list',
  standalone: true,
  imports: [CommonModule, PostFactura, PostExperiencia],
  templateUrl: './feed-list.html',
  styleUrl: './feed-list.scss'
})
export class FeedList implements OnInit, OnChanges {
  @Input() posts: Post[] = [];
  @Input() isLoading = false;
  @Input() hasMore = true;
  
  @Output() postUpdated = new EventEmitter<Post>();
  @Output() postDeleted = new EventEmitter<string>();
  @Output() loadMore = new EventEmitter<void>();
  
  filteredPosts: Post[] = [];
  loading = true;
  error: string | null = null;
  currentFilter: string = 'inicio';

  constructor(private postService: PostService) {}

  ngOnInit(): void {
    this.filterPosts();
  }

  ngOnChanges(): void {
    this.filterPosts();
  }

  onReaction(postId: string, reactionType: 'like' | 'love' | 'laugh'): void {
    // Emit to parent component to handle the reaction
    const post = this.posts.find(p => p._id === postId);
    if (post) {
      this.postUpdated.emit(post);
    }
  }

  onComment(postId: string, comment: string): void {
    // Emit to parent component to handle the comment
    const post = this.posts.find(p => p._id === postId);
    if (post) {
      this.postUpdated.emit(post);
    }
  }

  onDeletePost(postId: string): void {
    this.postDeleted.emit(postId);
  }

  onLoadMore(): void {
    this.loadMore.emit();
  }

  getAuthorName(authorId: any): string {
    if (!authorId) return 'Usuario Desconocido';
    
    // Si authorId es un objeto con firstName y lastName
    if (typeof authorId === 'object' && authorId.firstName && authorId.lastName) {
      return `${authorId.firstName} ${authorId.lastName}`;
    }
    
    // Si authorId es un string (ID)
    if (typeof authorId === 'string') {
      return 'Usuario';
    }
    
    // Fallback
    return 'Usuario Desconocido';
  }

  getLikeCount(reactions: any): number {
    if (Array.isArray(reactions)) {
      return reactions.filter(r => r.type === 'like').length;
    }
    return reactions?.like || 0;
  }

  getReactionCounts(reactions: any): any {
    return reactions || { like: 0, love: 0, laugh: 0 };
  }

  onFilterChanged(filter: string): void {
    this.currentFilter = filter;
    this.filterPosts();
  }

  private filterPosts(): void {
    // Para FeedList, simplemente mostramos todos los posts
    // El filtrado se hace en el componente padre (Feed)
    this.filteredPosts = this.posts;
  }
} 