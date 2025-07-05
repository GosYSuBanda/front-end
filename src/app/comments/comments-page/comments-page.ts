import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Comment } from '../comment/comment';
import { PostService } from '../../services/post.service';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-comments-page',
  standalone: true,
  imports: [CommonModule, Comment],
  templateUrl: './comments-page.html',
  styleUrl: './comments-page.scss'
})
export class CommentsPage implements OnInit {
  postId: string = '';
  post: Post | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private postService: PostService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.postId = params['postId'];
      this.loadPost();
    });
  }

  loadPost(): void {
    if (!this.postId) return;
    
    this.loading = true;
    this.postService.getPostById(this.postId).subscribe({
      next: (post) => {
        this.post = post;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading post:', error);
        this.error = 'Error al cargar el post';
        this.loading = false;
      }
    });
  }

  addComment(commentText: string): void {
    if (!this.postId || !commentText.trim()) return;

    this.postService.addComment(this.postId, { comment: commentText }).subscribe({
      next: (updatedPost) => {
        this.post = updatedPost;
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
}
