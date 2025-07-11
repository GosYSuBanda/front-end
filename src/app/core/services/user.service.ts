import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap, shareReplay } from 'rxjs/operators';
import { ApiService } from './api.service';
import { 
  User, 
  UserMetrics, 
  UserSearchFilters, 
  UserSuggestion,
  PaginatedResponse
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // Cache management
  private userCache = new Map<string, BehaviorSubject<User>>();
  private metricsCache = new Map<string, BehaviorSubject<UserMetrics>>();
  
  constructor(private apiService: ApiService) {}

  /**
   * Get user by ID
   */
  getUser(userId: string): Observable<User> {
    const cacheKey = `user_${userId}`;
    
    if (this.userCache.has(cacheKey)) {
      const cachedUser = this.userCache.get(cacheKey);
      if (cachedUser) {
        return cachedUser.asObservable();
      }
    }

    return this.apiService.get<User>(`/users/${userId}`)
      .pipe(
        tap(user => {
          this.updateUserCache(cacheKey, user);
        }),
        shareReplay(1)
      );
  }

  /**
   * Update user profile
   */
  updateProfile(userId: string, userData: Partial<User>): Observable<User> {
    return this.apiService.patch<User>(`/users/${userId}`, userData)
      .pipe(
        tap(user => {
          this.updateUserCache(`user_${userId}`, user);
        })
      );
  }

  /**
   * Upload profile picture
   */
  uploadProfilePicture(userId: string, file: File): Observable<any> {
    return this.apiService.uploadFile(`/users/${userId}/profile-picture`, file)
      .pipe(
        tap(() => {
          this.invalidateUserCache(userId);
        })
      );
  }

  /**
   * Search users
   */
  searchUsers(filters: UserSearchFilters): Observable<PaginatedResponse<User>> {
    return this.apiService.getPaginated<User>('/users/search', filters)
      .pipe(shareReplay(1));
  }

  /**
   * Get user suggestions
   */
  getUserSuggestions(page = 1, limit = 10): Observable<PaginatedResponse<UserSuggestion>> {
    const params = { page, limit };
    
    return this.apiService.getPaginated<UserSuggestion>('/users/suggestions', params)
      .pipe(shareReplay(1));
  }

  /**
   * Get popular users
   */
  getPopularUsers(page = 1, limit = 10): Observable<PaginatedResponse<User>> {
    const params = { page, limit };
    
    return this.apiService.getPaginated<User>('/users/popular', params)
      .pipe(shareReplay(1));
  }

  /**
   * Get trending users
   */
  getTrendingUsers(page = 1, limit = 10): Observable<PaginatedResponse<User>> {
    const params = { page, limit };
    
    return this.apiService.getPaginated<User>('/users/trending', params)
      .pipe(shareReplay(1));
  }

  /**
   * Get user metrics
   */
  getUserMetrics(userId: string): Observable<UserMetrics> {
    const cacheKey = `metrics_${userId}`;
    
    if (this.metricsCache.has(cacheKey)) {
      const cachedMetrics = this.metricsCache.get(cacheKey);
      if (cachedMetrics) {
        return cachedMetrics.asObservable();
      }
    }

    return this.apiService.get<UserMetrics>(`/users/${userId}/metrics`)
      .pipe(
        tap(metrics => {
          this.updateMetricsCache(cacheKey, metrics);
        }),
        shareReplay(1)
      );
  }

  /**
   * Follow user
   */
  followUser(userId: string): Observable<any> {
    return this.apiService.post(`/users/${userId}/follow`, {})
      .pipe(
        tap(() => {
          this.invalidateUserCache(userId);
          this.invalidateMetricsCache(userId);
        })
      );
  }

  /**
   * Unfollow user
   */
  unfollowUser(userId: string): Observable<any> {
    return this.apiService.delete(`/users/${userId}/follow`)
      .pipe(
        tap(() => {
          this.invalidateUserCache(userId);
          this.invalidateMetricsCache(userId);
        })
      );
  }

  /**
   * Get user followers
   */
  getUserFollowers(userId: string, page = 1, limit = 20): Observable<PaginatedResponse<User>> {
    const params = { page, limit };
    
    return this.apiService.getPaginated<User>(`/users/${userId}/followers`, params)
      .pipe(shareReplay(1));
  }

  /**
   * Get user following
   */
  getUserFollowing(userId: string, page = 1, limit = 20): Observable<PaginatedResponse<User>> {
    const params = { page, limit };
    
    return this.apiService.getPaginated<User>(`/users/${userId}/following`, params)
      .pipe(shareReplay(1));
  }

  /**
   * Block user
   */
  blockUser(userId: string): Observable<any> {
    return this.apiService.post(`/users/${userId}/block`, {});
  }

  /**
   * Unblock user
   */
  unblockUser(userId: string): Observable<any> {
    return this.apiService.delete(`/users/${userId}/block`);
  }

  /**
   * Get blocked users
   */
  getBlockedUsers(page = 1, limit = 20): Observable<PaginatedResponse<User>> {
    const params = { page, limit };
    
    return this.apiService.getPaginated<User>('/users/blocked', params)
      .pipe(shareReplay(1));
  }

  /**
   * Report user
   */
  reportUser(userId: string, reason: string, details?: string): Observable<any> {
    const data = { reason, details };
    
    return this.apiService.post(`/users/${userId}/report`, data);
  }

  /**
   * Update user preferences
   */
  updatePreferences(userId: string, preferences: any): Observable<any> {
    return this.apiService.patch(`/users/${userId}/preferences`, preferences)
      .pipe(
        tap(() => {
          this.invalidateUserCache(userId);
        })
      );
  }

  /**
   * Update business info
   */
  updateBusinessInfo(userId: string, businessInfo: any): Observable<any> {
    return this.apiService.patch(`/users/${userId}/business-info`, businessInfo)
      .pipe(
        tap(() => {
          this.invalidateUserCache(userId);
        })
      );
  }

  /**
   * Verify user account
   */
  verifyAccount(userId: string): Observable<any> {
    return this.apiService.post(`/users/${userId}/verify`, {});
  }

  /**
   * Get user activity feed
   */
  getUserActivity(userId: string, page = 1, limit = 20): Observable<PaginatedResponse<any>> {
    const params = { page, limit };
    
    return this.apiService.getPaginated<any>(`/users/${userId}/activity`, params)
      .pipe(shareReplay(1));
  }

  /**
   * Get mutual connections
   */
  getMutualConnections(userId: string, page = 1, limit = 20): Observable<PaginatedResponse<User>> {
    const params = { page, limit };
    
    return this.apiService.getPaginated<User>(`/users/${userId}/mutual-connections`, params)
      .pipe(shareReplay(1));
  }

  /**
   * Get user connections by sector
   */
  getConnectionsBySector(userId: string, sector: string, page = 1, limit = 20): Observable<PaginatedResponse<User>> {
    const params = { sector, page, limit };
    
    return this.apiService.getPaginated<User>(`/users/${userId}/connections-by-sector`, params)
      .pipe(shareReplay(1));
  }

  /**
   * Get user recommendations
   */
  getUserRecommendations(userId: string, type: string = 'all', limit = 10): Observable<UserSuggestion[]> {
    const params = { type, limit };
    
    return this.apiService.get<UserSuggestion[]>(`/users/${userId}/recommendations`, params)
      .pipe(shareReplay(1));
  }

  /**
   * Update user location
   */
  updateLocation(userId: string, location: any): Observable<any> {
    return this.apiService.patch(`/users/${userId}/location`, location)
      .pipe(
        tap(() => {
          this.invalidateUserCache(userId);
        })
      );
  }

  /**
   * Get nearby users
   */
  getNearbyUsers(latitude: number, longitude: number, radius = 50, page = 1, limit = 20): Observable<PaginatedResponse<User>> {
    const params = { latitude, longitude, radius, page, limit };
    
    return this.apiService.getPaginated<User>('/users/nearby', params)
      .pipe(shareReplay(1));
  }

  /**
   * Get user network stats
   */
  getNetworkStats(userId: string): Observable<any> {
    return this.apiService.get(`/users/${userId}/network-stats`)
      .pipe(shareReplay(1));
  }

  /**
   * Export user data
   */
  exportUserData(userId: string): Observable<Blob> {
    return this.apiService.downloadFile(`/users/${userId}/export`);
  }

  /**
   * Delete user account
   */
  deleteAccount(userId: string): Observable<any> {
    return this.apiService.delete(`/users/${userId}`)
      .pipe(
        tap(() => {
          this.clearUserCache(userId);
        })
      );
  }

  /**
   * Deactivate user account
   */
  deactivateAccount(userId: string): Observable<any> {
    return this.apiService.patch(`/users/${userId}/deactivate`, {})
      .pipe(
        tap(() => {
          this.invalidateUserCache(userId);
        })
      );
  }

  /**
   * Reactivate user account
   */
  reactivateAccount(userId: string): Observable<any> {
    return this.apiService.patch(`/users/${userId}/reactivate`, {})
      .pipe(
        tap(() => {
          this.invalidateUserCache(userId);
        })
      );
  }

  /**
   * Check follow status
   */
  checkFollowStatus(userId: string): Observable<boolean> {
    return this.apiService.get<{ isFollowing: boolean }>(`/users/${userId}/follow-status`)
      .pipe(
        map(response => response.isFollowing),
        shareReplay(1)
      );
  }

  /**
   * Get followers (alias for getUserFollowers)
   */
  getFollowers(userId: string, page = 1, limit = 20): Observable<PaginatedResponse<User>> {
    return this.getUserFollowers(userId, page, limit);
  }

  /**
   * Get following (alias for getUserFollowing)
   */
  getFollowing(userId: string, page = 1, limit = 20): Observable<PaginatedResponse<User>> {
    return this.getUserFollowing(userId, page, limit);
  }

  /**
   * Get session history
   */
  getSessionHistory(userId: string, page = 1, limit = 20): Observable<PaginatedResponse<any>> {
    const params = { page, limit };
    
    return this.apiService.getPaginated<any>(`/users/${userId}/sessions`, params)
      .pipe(shareReplay(1));
  }

  /**
   * Cache management methods
   */
  private updateUserCache(cacheKey: string, user: User): void {
    if (!this.userCache.has(cacheKey)) {
      this.userCache.set(cacheKey, new BehaviorSubject<User>(user));
    } else {
      this.userCache.get(cacheKey)?.next(user);
    }
  }

  private updateMetricsCache(cacheKey: string, metrics: UserMetrics): void {
    if (!this.metricsCache.has(cacheKey)) {
      this.metricsCache.set(cacheKey, new BehaviorSubject<UserMetrics>(metrics));
    } else {
      this.metricsCache.get(cacheKey)?.next(metrics);
    }
  }

  private invalidateUserCache(userId: string): void {
    this.userCache.delete(`user_${userId}`);
  }

  private invalidateMetricsCache(userId: string): void {
    this.metricsCache.delete(`metrics_${userId}`);
  }

  private clearUserCache(userId: string): void {
    this.userCache.delete(`user_${userId}`);
    this.metricsCache.delete(`metrics_${userId}`);
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.userCache.clear();
    this.metricsCache.clear();
  }
} 