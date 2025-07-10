import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { Post, PostResponse } from '../models/post.model';
import { API_CONFIG } from '../config/api.config';
import { AuthService } from './auth.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.posts}`;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private userService: UserService
  ) { }

  getPosts(): Observable<PostResponse> {
    return this.http.get<{success: boolean, message: string, data: Post[], pagination?: any}>(this.apiUrl).pipe(
      map(response => {
        console.log('PostService - Raw response from backend:', response);
        
        // Debug: Verificar las reacciones en cada post
        if (response.data && response.data.length > 0) {
          response.data.forEach((post, index) => {
            console.log(`PostService - Post ${index + 1} reactions:`, {
              postId: post._id,
              reactions: post.reactions,
              reactionsType: typeof post.reactions,
              isArray: Array.isArray(post.reactions),
              likes: post.reactions?.like || 0,
              loves: post.reactions?.love || 0,
              laughs: post.reactions?.laugh || 0
            });
          });
        }
        
        return {
          success: response.success,
          data: response.data
        };
      })
    );
  }

  getPostById(id: string): Observable<Post> {
    return this.http.get<{success: boolean, message: string, data: Post}>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data)
    );
  }

  createPost(post: Partial<Post>): Observable<Post> {
    const currentUserId = this.authService.getCurrentUserId();
    if (!currentUserId) {
      throw new Error('Usuario no autenticado');
    }

    // Verificar que el usuario existe antes de crear el post
    return this.userService.getUserById(currentUserId).pipe(
      switchMap(user => {
        console.log('User found:', user);
        
        const postData = {
          title: post.title,
          content: post.content,
          postType: post.postType || 'general',
          authorId: currentUserId,
          images: post.images || [],
          invoiceId: post.invoiceId || undefined,
          imageUrls: post.imageUrl ? [post.imageUrl] : []
        };

        console.log('Sending post data:', postData);
        console.log('API URL:', this.apiUrl);

        return this.http.post<{success: boolean, message: string, data: Post}>(this.apiUrl, postData).pipe(
          map(response => {
            console.log('Post created successfully:', response);
            return response.data;
          }),
          catchError(error => {
            console.error('Error creating post:', error);
            console.error('Error details:', error.error);
            return throwError(() => new Error(`Error al crear el post: ${error.error?.message || error.message}`));
          })
        );
      }),
      catchError(error => {
        console.error('Error verifying user:', error);
        return throwError(() => new Error(`Usuario no encontrado: ${error.error?.message || error.message}`));
      })
    );
  }

  updatePost(id: string, post: Partial<Post>): Observable<Post> {
    return this.http.put<{success: boolean, message: string, data: Post}>(`${this.apiUrl}/${id}`, post).pipe(
      map(response => response.data)
    );
  }

  deletePost(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  addReaction(postId: string, reactionType: 'like' | 'love' | 'laugh'): Observable<Post> {
    const currentUserId = this.authService.getCurrentUserId();
    if (!currentUserId) {
      throw new Error('Usuario no autenticado');
    }

    const payload = {
      userId: currentUserId,
      type: reactionType
    };
    console.log('Sending reaction payload:', payload);
    
    // El backend solo devuelve un mensaje de éxito, no el post actualizado
    // Por eso necesitamos obtener el post actualizado después
    return this.http.post<{success: boolean, message: string}>(`${this.apiUrl}/${postId}/reactions`, payload).pipe(
      switchMap(() => {
        // Después de agregar la reacción, obtener el post actualizado
        return this.getPostById(postId);
      })
    );
  }

  addComment(postId: string, comment: { comment: string }): Observable<Post> {
    const currentUserId = this.authService.getCurrentUserId();
    if (!currentUserId) {
      throw new Error('Usuario no autenticado');
    }

    const payload = {
      userId: currentUserId,
      comment: comment.comment
    };
    console.log('Sending comment payload:', payload);
    return this.http.post<{success: boolean, message: string, data: Post}>(`${this.apiUrl}/${postId}/comments`, payload).pipe(
      map(response => response.data)
    );
  }
} 