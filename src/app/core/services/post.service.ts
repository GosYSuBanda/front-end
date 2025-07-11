import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, shareReplay, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiService } from './api.service';
import { 
  Post, 
  CreatePostRequest, 
  PostFilters, 
  PaginatedResponse,
  FeedType
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private readonly baseUrl = environment.apiUrl || 'http://localhost:3000/api';
  
  // Cache management
  private feedCache = new Map<string, BehaviorSubject<Post[]>>();
  private postCache = new Map<string, BehaviorSubject<Post>>();
  
  // Feed state management
  private currentFeedType = new BehaviorSubject<FeedType>({ type: 'following' });
  public currentFeedType$ = this.currentFeedType.asObservable();

  constructor(
    private apiService: ApiService,
    private http: HttpClient
  ) {}

  /**
   * Get posts feed
   */
  getFeed(feedType: FeedType['type'] = 'following', filters?: PostFilters): Observable<PaginatedResponse<Post>> {
    return this.apiService.getPaginated<Post>('/posts/feed', { feedType, ...filters })
      .pipe(shareReplay(1));
  }

  /**
   * Get all posts
   */
  getAllPosts(filters?: PostFilters): Observable<PaginatedResponse<Post>> {
    return this.apiService.getPaginated<Post>('/posts', filters)
      .pipe(shareReplay(1));
  }

  /**
   * Search posts
   */
  searchPosts(query: string, filters?: PostFilters): Observable<PaginatedResponse<Post>> {
    const params = { search: query, ...filters };
    
    return this.apiService.getPaginated<Post>('/posts/search', params)
      .pipe(shareReplay(1));
  }

  /**
   * Get post by ID
   */
  getPost(postId: string): Observable<Post> {
    return this.apiService.get<Post>(`/posts/${postId}`)
      .pipe(shareReplay(1));
  }

  /**
   * Create new post - MÉTODO DIRECTO CON TOKEN CORRECTO
   */
  createPost(postData: CreatePostRequest): Observable<any> {
    const formData = new FormData();
    
    // Campos requeridos por el backend
    formData.append('title', postData.content.substring(0, 50) + (postData.content.length > 50 ? '...' : ''));
    formData.append('content', postData.content);
    formData.append('postType', this.mapFrontendTypeToBackend(postData.type));
    
    // Agregar archivos si existen
    if (postData.media && postData.media.length > 0) {
      postData.media.forEach(file => {
        formData.append('files', file);
      });
      console.log(`📎 Adding ${postData.media.length} files`);
    }

    // Obtener token con la clave correcta
    const token = localStorage.getItem('finsmart_access_token');

    console.log('📤 PostService DIRECT sending FormData:');
    console.log('🔑 Token available:', !!token);
    console.log('🔑 Token preview:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
    
    for (const pair of formData.entries()) {
      if (pair[1] instanceof File) {
        console.log(`  ${pair[0]}: File(${pair[1].name}, ${pair[1].size} bytes)`);
      } else {
        console.log(`  ${pair[0]}: "${pair[1]}"`);
      }
    }

    return this.http.post<any>(`${this.baseUrl}/posts`, formData, { 
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .pipe(
        tap(response => {
          console.log('✅ DIRECT Backend response:', response);
        }),
        catchError(error => {
          console.error('❌ DIRECT Error in createPost:', error);
          console.error('❌ DIRECT Error details:', {
            status: error.status,
            statusText: error.statusText,
            error: error.error,
            message: error.message
          });
          throw error;
        })
      );
  }

  private mapFrontendTypeToBackend(frontendType: string): string {
    const typeMap: { [key: string]: string } = {
      'text': 'general',
      'image': 'general',
      'video': 'general',
      'experience': 'general',
      'invoice': 'invoice',
      'job': 'announcement',
      'event': 'announcement',
      'link': 'general',
      'poll': 'question'
    };
    
    return typeMap[frontendType] || 'general';
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.feedCache.clear();
    this.postCache.clear();
  }
} 