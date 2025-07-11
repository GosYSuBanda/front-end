import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { SearchService } from '../core/services/search.service';
import { UserService } from '../core/services/user.service';
// import { PostService } from '../core/services/post.service';
import { User } from '../core/models/user.model';
import { Post } from '../core/models/post.model';
import { LoadingSpinnerComponent } from '../shared/components/loading-spinner/loading-spinner.component';
import { AvatarComponent } from '../shared/components/avatar/avatar.component';
import { TimeAgoPipe } from '../shared/pipes/time-ago.pipe';
import { takeUntil } from 'rxjs/operators';

interface SearchResult {
  users: User[];
  posts: Post[];
  totalUsers: number;
  totalPosts: number;
  query: string;
  filters: SearchFilters;
}

interface SearchFilters {
  type: 'all' | 'users' | 'posts' | 'companies';
  location?: string;
  industry?: string;
  postType?: Post['type'];
  dateRange?: 'today' | 'week' | 'month' | 'year' | 'all';
  sortBy?: 'relevance' | 'newest' | 'oldest' | 'popular';
  verified?: boolean;
}

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LoadingSpinnerComponent,
    AvatarComponent,
    TimeAgoPipe
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent implements OnInit, OnDestroy {
  searchQuery = '';
  searchResults: SearchResult | null = null;
  isLoading = false;
  error: string | null = null;
  
  // User management
  currentUser: any = null;
  followingUsers = new Set<string>();
  
  // Search filters
  filters: SearchFilters = {
    type: 'all',
    sortBy: 'relevance',
    dateRange: 'all'
  };

  // Search suggestions
  suggestions: any[] = [];
  showSuggestions = false;
  
  // Pagination
  currentPage = 1;
  pageSize = 20;
  hasMore = true;

  // Search history
  searchHistory: string[] = [];
  showHistory = false;

  // Trending searches
  trendingSearches: string[] = [];

  // Filter options
  industries = [
    'Tecnología', 'Finanzas', 'Salud', 'Educación', 'Retail',
    'Manufactura', 'Servicios', 'Construcción', 'Transporte', 'Otros'
  ];

  postTypes = [
    { value: 'text', label: 'Texto' },
    { value: 'image', label: 'Imagen' },
    { value: 'video', label: 'Video' },
    { value: 'link', label: 'Enlace' },
    { value: 'experience', label: 'Experiencia' },
    { value: 'invoice', label: 'Factura' },
    { value: 'job', label: 'Trabajo' },
    { value: 'event', label: 'Evento' }
  ];

  // Search subject for debouncing
  private searchSubject = new Subject<string>();
  private subscriptions: Subscription[] = [];

  constructor(
    private searchService: SearchService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Set up search debouncing
    this.subscriptions.push(
      this.searchSubject
        .pipe(
          debounceTime(300),
          distinctUntilChanged(),
          switchMap(query => {
            if (query.trim().length < 2) {
              return [];
            }
            return this.searchService.getSearchSuggestions(query);
          })
        )
        .subscribe({
          next: (suggestions) => {
            this.suggestions = suggestions;
            this.showSuggestions = true;
          },
          error: (error) => {
            console.error('Error getting suggestions:', error);
          }
        })
    );

    // Check for initial search query from URL
    this.subscriptions.push(
      this.route.queryParams.subscribe(params => {
        if (params['q']) {
          this.searchQuery = params['q'];
          if (params['type']) {
            this.filters.type = params['type'];
          }
          this.performSearch();
        }
      })
    );

    // Load search history and trending searches
    this.loadSearchHistory();
    this.loadTrendingSearches();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  onSearchInput(): void {
    // Show suggestions for search input
    if (this.searchQuery.trim()) {
      this.searchSubject.next(this.searchQuery);
    } else {
      this.suggestions = [];
      this.showSuggestions = false;
    }
  }

  onSearchSubmit(): void {
    if (this.searchQuery.trim()) {
      this.hideSuggestions();
      this.performSearch();
      this.addToSearchHistory(this.searchQuery);
      this.updateUrlParams();
    }
  }

  performSearch(): void {
    if (!this.searchQuery.trim()) {
      this.resetSearch();
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.searchService.searchGlobal(this.searchQuery, { 
      page: this.currentPage, 
      limit: this.pageSize 
    }).pipe(takeUntil(this.subscriptions)).subscribe({
      next: (results) => {
        // Convert GlobalSearchResult to SearchResult format
        this.searchResults = {
          users: results.users.items || [],
          posts: results.posts.items || [],
          totalUsers: results.users.total || 0,
          totalPosts: results.posts.total || 0,
          query: this.searchQuery,
          filters: this.filters
        };
        
        this.hasMore = results.users.items.length >= this.pageSize || results.posts.items.length >= this.pageSize;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error searching:', error);
        this.error = 'Error al realizar la búsqueda';
        this.isLoading = false;
      }
    });
  }

  loadMore(): void {
    // Alias for loadMoreResults for backward compatibility
    this.loadMoreResults();
  }

  loadMoreResults(): void {
    if (this.isLoading || !this.hasMore) return;

    this.currentPage++;
    this.isLoading = true;

    this.searchService.searchGlobal(this.searchQuery, { 
      page: this.currentPage, 
      limit: this.pageSize 
    }).pipe(takeUntil(this.subscriptions)).subscribe({
      next: (results) => {
        // Manejo de nulos y undefined
        if (!this.searchResults) {
          this.isLoading = false;
          return;
        }

        const nuevosUsuarios = results?.users?.items ?? results?.users?.items ?? [];
        const nuevosPosts = results?.posts?.items ?? results?.posts?.items ?? [];

        this.searchResults.users = [...(this.searchResults.users ?? []), ...nuevosUsuarios];
        this.searchResults.posts = [...(this.searchResults.posts ?? []), ...nuevosPosts];

        const usuariosLength = Array.isArray(nuevosUsuarios) ? nuevosUsuarios.length : 0;
        const postsLength = Array.isArray(nuevosPosts) ? nuevosPosts.length : 0;

        this.hasMore = usuariosLength >= this.pageSize || postsLength >= this.pageSize;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading more:', error);
        this.isLoading = false;
      }
    });
  }

  selectSuggestion(suggestion: any): void {
    if (suggestion.type === 'search') {
      this.searchQuery = suggestion.query;
      this.onSearchSubmit();
    } else if (suggestion.type === 'user') {
      this.router.navigate(['/profile', suggestion.id]);
    } else if (suggestion.type === 'post') {
      this.router.navigate(['/feed'], { queryParams: { postId: suggestion.id } });
    }
    this.hideSuggestions();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.performSearch();
    this.updateUrlParams();
  }

  clearFilters(): void {
    this.filters = {
      type: 'all',
      sortBy: 'relevance',
      dateRange: 'all'
    };
    this.currentPage = 1;
    this.performSearch();
    this.updateUrlParams();
  }

  followUser(user: any): void {
    if (this.followingUsers.has(user._id)) return;

    this.followingUsers.add(user._id);
    
    this.userService.followUser(user._id).pipe(takeUntil(this.subscriptions)).subscribe({
      next: () => {
        if (this.currentUser) {
          // Update followers count
          if (typeof user.followers === 'number') {
            user.followers++;
          } else if (Array.isArray(user.followers)) {
            user.followers = user.followers.length + 1;
          }
          user.isFollowing = true;
        }
        this.followingUsers.delete(user._id);
      },
      error: (error) => {
        console.error('Error following user:', error);
        this.followingUsers.delete(user._id);
      }
    });
  }

  unfollowUser(user: any): void {
    if (this.followingUsers.has(user._id)) return;

    this.followingUsers.add(user._id);
    
    this.userService.unfollowUser(user._id).pipe(takeUntil(this.subscriptions)).subscribe({
      next: () => {
        if (this.currentUser) {
          // Update followers count
          if (typeof user.followers === 'number') {
            user.followers--;
          } else if (Array.isArray(user.followers)) {
            user.followers = Math.max(0, user.followers.length - 1);
          }
          user.isFollowing = false;
        }
        this.followingUsers.delete(user._id);
      },
      error: (error) => {
        console.error('Error unfollowing user:', error);
        this.followingUsers.delete(user._id);
      }
    });
  }

  navigateToProfile(userId: string): void {
    this.router.navigate(['/profile', userId]);
  }

  navigateToPost(postId: string): void {
    this.router.navigate(['/feed'], { queryParams: { postId } });
  }

  onSearchFocus(): void {
    if (this.searchQuery.trim().length === 0) {
      this.showHistory = true;
      this.loadTrendingSearches();
    } else if (this.suggestions.length > 0) {
      this.showSuggestions = true;
    }
  }

  onSearchBlur(): void {
    // Delay to allow click on suggestions
    setTimeout(() => {
      this.showSuggestions = false;
      this.showHistory = false;
    }, 200);
  }

  hideSuggestions(): void {
    this.showSuggestions = false;
    this.showHistory = false;
  }

  selectHistoryItem(query: string): void {
    this.searchQuery = query;
    this.onSearchSubmit();
  }

  selectTrendingSearch(query: string): void {
    this.searchQuery = query;
    this.onSearchSubmit();
  }

  clearSearchHistory(): void {
    this.searchHistory = [];
    this.searchService.clearSearchHistory();
    this.showHistory = false;
  }

  removeFromHistory(query: string): void {
    this.searchHistory = this.searchHistory.filter(h => h !== query);
    this.searchService.removeFromSearchHistory(query);
  }

  private loadSearchHistory(): void {
    this.searchService.getSearchHistory().subscribe({
      next: (history) => {
        this.searchHistory = history;
      },
      error: (error) => {
        console.error('Error loading search history:', error);
      }
    });
  }

  private loadTrendingSearches(): void {
    this.searchService.getTrendingSearches().pipe(takeUntil(this.subscriptions)).subscribe({
      next: (trending) => {
        // Convert SearchSuggestion[] to string[]
        this.trendingSearches = trending.map(suggestion => suggestion.text);
      },
      error: (error) => {
        console.error('Error loading trending searches:', error);
      }
    });
  }

  private addToSearchHistory(query: string): void {
    if (!this.searchHistory.includes(query)) {
      this.searchHistory.unshift(query);
      this.searchHistory = this.searchHistory.slice(0, 10); // Keep only last 10
      this.searchService.addToSearchHistory(query);
    }
  }

  private updateUrlParams(): void {
    const queryParams: any = {
      q: this.searchQuery
    };

    if (this.filters.type !== 'all') {
      queryParams.type = this.filters.type;
    }

    if (this.filters.location) {
      queryParams.location = this.filters.location;
    }

    if (this.filters.industry) {
      queryParams.industry = this.filters.industry;
    }

    if (this.filters.postType) {
      queryParams.postType = this.filters.postType;
    }

    if (this.filters.dateRange !== 'all') {
      queryParams.dateRange = this.filters.dateRange;
    }

    if (this.filters.sortBy !== 'relevance') {
      queryParams.sortBy = this.filters.sortBy;
    }

    if (this.filters.verified) {
      queryParams.verified = this.filters.verified;
    }

    this.router.navigate(['/search'], { queryParams });
  }

  private resetSearch(): void {
    this.searchResults = null;
    this.currentPage = 1;
    this.hasMore = true;
    this.isLoading = false;
    this.error = null;
  }

  getResultsCount(): number {
    if (!this.searchResults) return 0;
    return this.searchResults.totalUsers + this.searchResults.totalPosts;
  }

  getFilteredResultsText(): string {
    if (!this.searchResults) return '';
    
    const { type } = this.filters;
    const { totalUsers, totalPosts } = this.searchResults;
    
    if (type === 'users') {
      return `${totalUsers} usuario${totalUsers !== 1 ? 's' : ''}`;
    } else if (type === 'posts') {
      return `${totalPosts} post${totalPosts !== 1 ? 's' : ''}`;
    } else {
      return `${totalUsers + totalPosts} resultado${totalUsers + totalPosts !== 1 ? 's' : ''}`;
    }
  }
} 