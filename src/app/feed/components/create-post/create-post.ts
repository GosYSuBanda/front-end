import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostService } from '../../../services/post.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-post.html',
  styleUrl: './create-post.scss'
})
export class CreatePost {
  postData = {
    title: '',
    content: '',
    postType: 'general' as 'general' | 'financial' | 'invoice' | 'question' | 'announcement',
    imageUrl: ''
  };
  isSubmitting = false;
  error: string | null = null;

  constructor(
    private postService: PostService,
    private authService: AuthService
  ) {}

  onSubmit(): void {
    if (!this.postData.title.trim() || !this.postData.content.trim()) {
      return;
    }

    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.error = 'Debes iniciar sesión para crear posts';
      return;
    }

    this.isSubmitting = true;
    this.error = null;
    
    this.postService.createPost(this.postData).subscribe({
      next: (newPost) => {
        console.log('Post created successfully:', newPost);
        this.resetForm();
        this.isSubmitting = false;
        // Emitir evento para actualizar la lista de posts
        window.location.reload(); // Temporal - mejor usar un servicio de eventos
      },
      error: (error) => {
        console.error('Error creating post:', error);
        this.error = error.message || 'Error al crear el post';
        this.isSubmitting = false;
      }
    });
  }

  private resetForm(): void {
    this.postData = {
      title: '',
      content: '',
      postType: 'general',
      imageUrl: ''
    };
  }

} 