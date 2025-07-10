import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostFactura } from '../components/post-factura/post-factura';
import { PostExperiencia } from '../components/post-experiencia/post-experiencia';
import { PostService } from '../../services/post.service';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-feed-list',
  imports: [CommonModule, PostFactura, PostExperiencia],
  templateUrl: './feed-list.html',
  styleUrl: './feed-list.scss'
})
export class FeedList implements OnInit {
  posts: Post[] = [];
  filteredPosts: Post[] = [];
  loading = true;
  error: string | null = null;
  currentFilter: string = 'inicio';

  constructor(private postService: PostService) {}

  // Helper function to transform reactions from array to object
  private transformReactions(reactions: any): any {
    if (Array.isArray(reactions)) {
      const reactionsCount = {
        like: 0,
        love: 0,
        laugh: 0,
        angry: 0,
        sad: 0
      };
      
      reactions.forEach((reaction: any) => {
        if (reactionsCount.hasOwnProperty(reaction.type)) {
          (reactionsCount as any)[reaction.type]++;
        }
      });
      
      return reactionsCount;
    }
    return reactions;
  }

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.loading = true;
    this.error = null;
    
    this.postService.getPosts().subscribe({
      next: (response) => {
        console.log('Posts response:', response);
        this.posts = response.data;
        
        // Debug: Verificar las reacciones de cada post
        this.posts.forEach((post, index) => {
          // Transformar reacciones si vienen como array
          post.reactions = this.transformReactions(post.reactions);
          
          console.log(`Post ${index + 1} (${post._id}):`, {
            content: post.content.substring(0, 50) + '...',
            reactions: post.reactions,
            reactionsType: typeof post.reactions,
            isArray: Array.isArray(post.reactions),
            likes: post.reactions?.like || 0,
            loves: post.reactions?.love || 0,
            laughs: post.reactions?.laugh || 0
          });
        });
        
        this.filterPosts();
        console.log('Posts loaded:', this.posts.length);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading posts:', error);
        this.error = 'Error al cargar los posts';
        this.loading = false;
      }
    });
  }

  onReaction(postId: string, reactionType: 'like' | 'love' | 'laugh'): void {
    this.postService.addReaction(postId, reactionType).subscribe({
      next: (updatedPost) => {
        // Transformar reacciones si vienen como array
        updatedPost.reactions = this.transformReactions(updatedPost.reactions);
        console.log('Updated post reactions after transformation:', updatedPost.reactions);
        
        // Update the post in the local array
        const index = this.posts.findIndex(p => p._id === postId);
        if (index !== -1) {
          this.posts[index] = updatedPost;
          this.filterPosts(); // Re-filter to update the view
        }
      },
      error: (error) => {
        console.error('Error adding reaction:', error);
      }
    });
  }

  onComment(postId: string, comment: string): void {
    this.postService.addComment(postId, { comment: comment }).subscribe({
      next: (updatedPost) => {
        // Transformar reacciones si vienen como array
        updatedPost.reactions = this.transformReactions(updatedPost.reactions);
        
        // Update the post in the local array
        const index = this.posts.findIndex(p => p._id === postId);
        if (index !== -1) {
          this.posts[index] = updatedPost;
          this.filterPosts(); // Re-filter to update the view
        }
      },
      error: (error) => {
        console.error('Error adding comment:', error);
      }
    });
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

  onFilterChanged(filter: string): void {
    this.currentFilter = filter;
    this.filterPosts();
  }

  private filterPosts(): void {
    switch (this.currentFilter) {
      case 'inicio':
        this.filteredPosts = this.posts; // Mostrar todos
        break;
      case 'facturas':
        this.filteredPosts = this.posts.filter(post => post.postType === 'invoice');
        break;
      case 'experiencias':
        this.filteredPosts = this.posts.filter(post => post.postType !== 'invoice');
        break;
      default:
        this.filteredPosts = this.posts;
    }
  }
} 