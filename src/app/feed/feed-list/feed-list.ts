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
        // Update the post in the local array
        const index = this.posts.findIndex(p => p._id === postId);
        if (index !== -1) {
          this.posts[index] = updatedPost;
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
        // Update the post in the local array
        const index = this.posts.findIndex(p => p._id === postId);
        if (index !== -1) {
          this.posts[index] = updatedPost;
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