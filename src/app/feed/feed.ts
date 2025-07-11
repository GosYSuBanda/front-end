import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { PostService } from '../core/services/post.service';
import { AuthService } from '../core/services/auth.service';
import { Post } from '../models/post.model';
import { FeedType, PostFilters } from '../core/models/post.model';
import { AuthUser } from '../core/models/auth.model';
import { LoadingSpinnerComponent } from '../shared/components/loading-spinner/loading-spinner.component';
import { FeedList } from './feed-list/feed-list';
import { CreatePost } from './components/create-post/create-post';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    LoadingSpinnerComponent,
    FeedList, 
    CreatePost
  ],
  templateUrl: './feed.html',
  styleUrl: './feed.scss'
})
export class Feed implements OnInit, OnDestroy {
  @ViewChild('feedList') feedList!: FeedList;
  @ViewChild('createPost') createPost!: CreatePost;

  currentUser: AuthUser | null = null;
  posts: Post[] = [];
  filteredPosts: Post[] = [];
  isLoading = false;
  error: string | null = null;

  // Filter options
  currentFilter: FeedType['type'] = 'following';
  currentType: Post['type'] | 'all' = 'all';
  searchQuery = '';

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPosts = 0;
  hasMore = true;

  // Feed types
  feedTypes = [
    { value: 'following' as const, label: 'Siguiendo', icon: 'fas fa-users' },
    { value: 'discover' as const, label: 'Descubrir', icon: 'fas fa-globe' },
    { value: 'trending' as const, label: 'Tendencias', icon: 'fas fa-fire' },
    { value: 'business' as const, label: 'Empresarial', icon: 'fas fa-building' },
    { value: 'saved' as const, label: 'Guardados', icon: 'fas fa-bookmark' }
  ];

  // Post types
  postTypes = [
    { value: 'all' as const, label: 'Todos', icon: 'fas fa-list' },
    { value: 'text' as const, label: 'Texto', icon: 'fas fa-font' },
    { value: 'image' as const, label: 'Imagen', icon: 'fas fa-image' },
    { value: 'video' as const, label: 'Video', icon: 'fas fa-video' },
    { value: 'link' as const, label: 'Enlace', icon: 'fas fa-link' },
    { value: 'experience' as const, label: 'Experiencia', icon: 'fas fa-lightbulb' },
    { value: 'invoice' as const, label: 'Factura', icon: 'fas fa-receipt' },
    { value: 'job' as const, label: 'Trabajo', icon: 'fas fa-briefcase' },
    { value: 'event' as const, label: 'Evento', icon: 'fas fa-calendar' }
  ];

  private subscriptions: Subscription[] = [];

  constructor(
    private postService: PostService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Subscribe to current user
    this.subscriptions.push(
      this.authService.user$.subscribe(user => {
        this.currentUser = user;
        if (user) {
          this.loadFeed();
        }
      })
    );

    // Check for query parameters
    this.subscriptions.push(
      this.route.queryParams.subscribe(params => {
        if (params['filter']) {
          this.currentFilter = params['filter'];
        }
        if (params['type']) {
          this.currentType = params['type'];
        }
        if (params['q']) {
          this.searchQuery = params['q'];
        }
        this.loadFeed();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadFeed(): void {
    if (!this.currentUser) return;

    this.isLoading = true;
    this.error = null;

    const filters: PostFilters = {
      page: this.currentPage,
      limit: this.pageSize,
      type: this.currentType === 'all' ? undefined : this.currentType
    };

    // Add search to filters if exists
    if (this.searchQuery.trim()) {
      this.postService.searchPosts(this.searchQuery, filters).subscribe({
        next: (response) => {
          this.handleFeedResponse(response);
        },
        error: (error) => {
          this.handleFeedError(error);
        }
      });
    } else {
      this.postService.getFeed(this.currentFilter, filters).subscribe({
        next: (response) => {
          this.handleFeedResponse(response);
        },
        error: (error) => {
          this.handleFeedError(error);
        }
      });
    }
  }

  private handleFeedResponse(response: any): void {
    console.log('📥 Feed response received:', response);
    
    // Manejar respuesta según estructura del backend
    let postsData: Post[] = [];
    
    if (response && response.data) {
      postsData = Array.isArray(response.data) ? response.data : [];
    } else if (response && Array.isArray(response)) {
      postsData = response;
    }
    
    console.log('📊 Posts data processed:', postsData);
    
    if (this.currentPage === 1) {
      this.posts = postsData;
    } else {
      this.posts = [...this.posts, ...postsData];
    }
    
    this.filteredPosts = [...this.posts];
    
    // Manejar paginación
    if (response && response.pagination) {
      this.totalPosts = response.pagination.total || 0;
      this.hasMore = response.pagination.hasNext || false;
    } else {
      this.totalPosts = postsData.length;
      this.hasMore = false;
    }
    
    this.isLoading = false;
    console.log('📋 Feed state updated:', {
      postsCount: this.posts.length,
      filteredCount: this.filteredPosts.length,
      hasMore: this.hasMore,
      totalPosts: this.totalPosts
    });
  }

  private handleFeedError(error: any): void {
    this.error = 'Error al cargar el feed. Por favor intenta nuevamente.';
    this.isLoading = false;
    console.error('Error loading feed:', error);
  }

  refreshFeed(): void {
    this.currentPage = 1;
    this.loadFeed();
  }

  loadMorePosts(): void {
    if (!this.hasMore || this.isLoading) return;

    this.currentPage++;
    this.loadFeed();
  }

  onFilterChanged(filter: FeedType['type']): void {
    this.currentFilter = filter;
    this.currentPage = 1;
    this.updateUrlParams();
    this.loadFeed();
  }

  onTypeChanged(type: Post['type'] | 'all'): void {
    this.currentType = type;
    this.currentPage = 1;
    this.updateUrlParams();
    this.loadFeed();
  }

  onSearchChanged(query: string): void {
    this.searchQuery = query;
    this.currentPage = 1;
    this.updateUrlParams();
    this.loadFeed();
  }

  onPostCreated(post: Post): void {
    this.posts.unshift(post);
    this.filteredPosts = [post, ...this.filteredPosts];
    this.totalPosts++;
  }

  onPostUpdated(updatedPost: Post): void {
    const index = this.posts.findIndex(p => p._id === updatedPost._id);
    if (index !== -1) {
      this.posts[index] = updatedPost;
      this.filteredPosts = [...this.posts];
    }
  }

  onPostDeleted(postId: string): void {
    this.posts = this.posts.filter(p => p._id !== postId);
    this.filteredPosts = this.filteredPosts.filter(p => p._id !== postId);
    this.totalPosts--;
  }

  onCreatePostClick(): void {
    // Navigate to create post or open modal - implementation depends on CreatePost component
    console.log('Create post clicked');
  }

  private updateUrlParams(): void {
    const queryParams: any = {};
    
    if (this.currentFilter !== 'following') {
      queryParams.filter = this.currentFilter;
    }
    
    if (this.currentType !== 'all') {
      queryParams.type = this.currentType;
    }
    
    if (this.searchQuery) {
      queryParams.q = this.searchQuery;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge'
    });
  }
}
