import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, switchMap, shareReplay } from 'rxjs/operators';
import { ApiService } from './api.service';
import { 
  User, 
  Post, 
  UserSearchFilters, 
  PostFilters, 
  PaginatedResponse
} from '../models';

export interface SearchResult<T> {
  items: T[];
  total: number;
  query: string;
  filters?: any;
  facets?: SearchFacet[];
}

export interface SearchFacet {
  field: string;
  values: Array<{
    value: string;
    count: number;
  }>;
}

export interface GlobalSearchResult {
  users: SearchResult<User>;
  posts: SearchResult<Post>;
  total: number;
  query: string;
}

export interface SearchSuggestion {
  text: string;
  type: 'user' | 'post' | 'tag' | 'company' | 'location';
  count?: number;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  // Search state management
  private searchHistorySubject = new BehaviorSubject<string[]>([]);
  private searchSuggestionsSubject = new BehaviorSubject<SearchSuggestion[]>([]);
  private recentSearches = new BehaviorSubject<string[]>([]);
  
  public searchHistory$ = this.searchHistorySubject.asObservable();
  public searchSuggestions$ = this.searchSuggestionsSubject.asObservable();
  public recentSearches$ = this.recentSearches.asObservable();

  private readonly SEARCH_HISTORY_KEY = 'search_history';
  private readonly MAX_HISTORY_ITEMS = 10;

  constructor(private apiService: ApiService) {
    this.loadSearchHistory();
  }

  /**
   * Global search across all content types
   */
  globalSearch(query: string, page = 1, limit = 10): Observable<GlobalSearchResult> {
    const params = { q: query, page, limit };
    
    return this.apiService.get<GlobalSearchResult>('/search/global', params)
      .pipe(
        tap(() => this.addToSearchHistory(query)),
        shareReplay(1)
      );
  }

  /**
   * Search users
   */
  searchUsers(query: string, filters?: UserSearchFilters): Observable<SearchResult<User>> {
    const params = { q: query, ...filters };
    
    return this.apiService.get<SearchResult<User>>('/search/users', params)
      .pipe(
        tap(() => this.addToSearchHistory(query)),
        shareReplay(1)
      );
  }

  /**
   * Search posts
   */
  searchPosts(query: string, filters?: PostFilters): Observable<SearchResult<Post>> {
    const params = { q: query, ...filters };
    
    return this.apiService.get<SearchResult<Post>>('/search/posts', params)
      .pipe(
        tap(() => this.addToSearchHistory(query)),
        shareReplay(1)
      );
  }

  /**
   * Search by tags
   */
  searchByTag(tag: string, type: 'posts' | 'users' = 'posts', page = 1, limit = 10): Observable<SearchResult<any>> {
    const params = { tag, type, page, limit };
    
    return this.apiService.get<SearchResult<any>>('/search/tags', params)
      .pipe(
        tap(() => this.addToSearchHistory(`#${tag}`)),
        shareReplay(1)
      );
  }

  /**
   * Search by location
   */
  searchByLocation(location: string, radius = 50, type: 'posts' | 'users' = 'posts', page = 1, limit = 10): Observable<SearchResult<any>> {
    const params = { location, radius, type, page, limit };
    
    return this.apiService.get<SearchResult<any>>('/search/location', params)
      .pipe(
        tap(() => this.addToSearchHistory(`📍 ${location}`)),
        shareReplay(1)
      );
  }

  /**
   * Search companies/businesses
   */
  searchCompanies(query: string, sector?: string, page = 1, limit = 10): Observable<SearchResult<any>> {
    const params = { q: query, sector, page, limit };
    
    return this.apiService.get<SearchResult<any>>('/search/companies', params)
      .pipe(
        tap(() => this.addToSearchHistory(query)),
        shareReplay(1)
      );
  }

  /**
   * Advanced search with multiple filters
   */
  advancedSearch(filters: any): Observable<SearchResult<any>> {
    return this.apiService.get<SearchResult<any>>('/search/advanced', filters)
      .pipe(
        tap(() => {
          if (filters.q) {
            this.addToSearchHistory(filters.q);
          }
        }),
        shareReplay(1)
      );
  }

  /**
   * Get search suggestions
   */
  getSearchSuggestions(query: string): Observable<SearchSuggestion[]> {
    if (!query || query.length < 2) {
      return new Observable(observer => {
        observer.next([]);
        observer.complete();
      });
    }

    const params = { q: query };
    
    return this.apiService.get<SearchSuggestion[]>('/search/suggestions', params)
      .pipe(
        tap(suggestions => {
          this.searchSuggestionsSubject.next(suggestions);
        }),
        shareReplay(1)
      );
  }

  /**
   * Get trending searches
   */
  getTrendingSearches(limit = 10): Observable<SearchSuggestion[]> {
    const params = { limit };
    
    return this.apiService.get<SearchSuggestion[]>('/search/trending', params)
      .pipe(shareReplay(1));
  }

  /**
   * Get popular tags
   */
  getPopularTags(limit = 20): Observable<Array<{ tag: string; count: number }>> {
    const params = { limit };
    
    return this.apiService.get<Array<{ tag: string; count: number }>>('/search/tags/popular', params)
      .pipe(shareReplay(1));
  }

  /**
   * Get search filters/facets
   */
  getSearchFilters(query: string, type: 'users' | 'posts' | 'companies'): Observable<SearchFacet[]> {
    const params = { q: query, type };
    
    return this.apiService.get<SearchFacet[]>('/search/filters', params)
      .pipe(shareReplay(1));
  }

  /**
   * Save search
   */
  saveSearch(name: string, query: string, filters?: any): Observable<any> {
    const data = { name, query, filters };
    
    return this.apiService.post('/search/saved', data);
  }

  /**
   * Get saved searches
   */
  getSavedSearches(): Observable<any[]> {
    return this.apiService.get<any[]>('/search/saved')
      .pipe(shareReplay(1));
  }

  /**
   * Delete saved search
   */
  deleteSavedSearch(searchId: string): Observable<any> {
    return this.apiService.delete(`/search/saved/${searchId}`);
  }

  /**
   * Get search analytics
   */
  getSearchAnalytics(period = '7d'): Observable<any> {
    const params = { period };
    
    return this.apiService.get('/search/analytics', params)
      .pipe(shareReplay(1));
  }

  /**
   * Search with autocomplete
   */
  autocompleteSearch(query: string): Observable<SearchSuggestion[]> {
    return this.getSearchSuggestions(query);
  }

  /**
   * Global search across all content types (alias for globalSearch)
   */
  searchGlobal(query: string, filters?: any): Observable<GlobalSearchResult> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    return this.globalSearch(query, page, limit);
  }

  /**
   * Get search history as Observable
   */
  getSearchHistory(): Observable<string[]> {
    return this.searchHistory$;
  }

  /**
   * Get search history as array (synchronous)
   */
  getSearchHistorySync(): string[] {
    return this.searchHistorySubject.value;
  }

  /**
   * Make addToSearchHistory public
   */
  public addToSearchHistory(query: string): void {
    if (!query || query.trim().length === 0) return;
    
    const currentHistory = this.searchHistorySubject.value;
    const newHistory = [query, ...currentHistory.filter(item => item !== query)]
      .slice(0, this.MAX_HISTORY_ITEMS);
    
    this.searchHistorySubject.next(newHistory);
    this.saveSearchHistory(newHistory);
  }

  /**
   * Clear search history
   */
  clearSearchHistory(): void {
    this.searchHistorySubject.next([]);
    this.saveSearchHistory([]);
  }

  /**
   * Remove from search history
   */
  removeFromSearchHistory(query: string): void {
    const currentHistory = this.searchHistorySubject.value;
    const updatedHistory = currentHistory.filter(item => item !== query);
    
    this.searchHistorySubject.next(updatedHistory);
    this.saveSearchHistory(updatedHistory);
  }

  /**
   * Load search history from storage
   */
  private loadSearchHistory(): void {
    try {
      const stored = localStorage.getItem(this.SEARCH_HISTORY_KEY);
      if (stored) {
        const history = JSON.parse(stored);
        this.searchHistorySubject.next(history);
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  }

  /**
   * Save search history to storage
   */
  private saveSearchHistory(history: string[]): void {
    try {
      localStorage.setItem(this.SEARCH_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  }

  /**
   * Create debounced search observable
   */
  createDebouncedSearch<T>(
    searchFn: (query: string) => Observable<T>, 
    debounceMs = 300
  ): (query: Observable<string>) => Observable<T> {
    return (query: Observable<string>) => 
      query.pipe(
        debounceTime(debounceMs),
        distinctUntilChanged(),
        switchMap(searchFn)
      );
  }
} 