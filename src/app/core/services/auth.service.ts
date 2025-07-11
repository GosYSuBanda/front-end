import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer, of, throwError } from 'rxjs';
import { map, tap, catchError, switchMap, shareReplay } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { StorageService } from './storage.service';
import { 
  AuthUser, 
  AuthState, 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  RegisterResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  VerifyEmailRequest,
  LogoutRequest,
  JwtPayload,
  SessionInfo
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'finsmart_access_token';
  private readonly REFRESH_TOKEN_KEY = 'finsmart_refresh_token';
  private readonly USER_KEY = 'finsmart_user_data';
  private readonly REMEMBER_ME_KEY = 'finsmart_remember_me';

  // Auth state management
  private authStateSubject = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
    accessToken: null,
    refreshToken: null,
    isLoading: false,
    error: null,
    lastActivity: null,
    sessionExpiry: null
  });

  public authState$ = this.authStateSubject.asObservable();
  public user$ = this.authState$.pipe(map(state => state.user));
  public isAuthenticated$ = this.authState$.pipe(map(state => state.isAuthenticated));
  public isLoading$ = this.authState$.pipe(map(state => state.isLoading));

  // Token refresh management
  private refreshTokenTimer: any;
  private readonly REFRESH_BUFFER_TIME = 5 * 60 * 1000; // 5 minutes before expiry

  constructor(
    private apiService: ApiService,
    private storageService: StorageService,
    private router: Router
  ) {
    this.initializeAuthState();
  }

  /**
   * Initialize authentication state from storage
   */
  private initializeAuthState(): void {
    console.log('🔍 Initializing auth state...');
    
    const accessToken = this.storageService.getItem(this.TOKEN_KEY);
    const refreshToken = this.storageService.getItem(this.REFRESH_TOKEN_KEY);
    const userData = this.storageService.getItem(this.USER_KEY);

    console.log('🔍 Tokens found:', { 
      accessToken: accessToken ? 'YES' : 'NO', 
      refreshToken: refreshToken ? 'YES' : 'NO',
      userData: userData ? 'YES' : 'NO'
    });

    if (accessToken && refreshToken && userData) {
      try {
        // Validate token format
        if (accessToken.split('.').length !== 3) {
          console.warn('⚠️ Invalid token format, clearing auth state');
          this.clearAuthState();
          return;
        }

        const user = JSON.parse(userData);
        const tokenPayload = this.decodeToken(accessToken);
        
        if (tokenPayload && !this.isTokenExpired(tokenPayload)) {
          console.log('✅ Token valid, setting authenticated state');
          this.updateAuthState({
            isAuthenticated: true,
            user,
            accessToken,
            refreshToken,
            sessionExpiry: new Date(tokenPayload.exp * 1000).toISOString()
          });
          
          this.scheduleTokenRefresh(tokenPayload.exp);
        } else {
          console.log('⚠️ Token expired or invalid, clearing auth state');
          this.clearAuthState();
        }
      } catch (error) {
        console.error('❌ Error initializing auth state:', error);
        this.clearAuthState();
      }
    } else {
      console.log('ℹ️ No auth data found in storage');
      // Asegurar que el estado esté limpio
      this.updateAuthState({
        isAuthenticated: false,
        user: null,
        accessToken: null,
        refreshToken: null,
        sessionExpiry: null
      });
    }
  }

  /**
   * User login
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    console.log('🔐 Starting login process...', { email: credentials.email });
    this.setLoading(true);

    return this.apiService.post<LoginResponse>('/auth/login', credentials)
      .pipe(
        tap(response => {
          console.log('✅ Login successful, response:', response);
          console.log('🔍 Response structure analysis:', {
            hasAccessToken: 'accessToken' in response,
            hasRefreshToken: 'refreshToken' in response,
            hasUser: 'user' in response,
            hasToken: 'token' in response,
            hasData: 'data' in response,
            responseKeys: Object.keys(response),
            fullResponse: response
          });
          this.handleAuthSuccess(response, credentials.rememberMe);
        }),
        catchError(error => {
          console.error('❌ Login failed:', error);
          this.setError(error.message || 'Error de autenticación');
          return throwError(error);
        }),
        tap(() => this.setLoading(false))
      );
  }

  /**
   * User registration
   */
  register(userData: RegisterRequest): Observable<RegisterResponse> {
    this.setLoading(true);

    return this.apiService.post<RegisterResponse>('/auth/register', userData)
      .pipe(
        tap(response => {
          this.handleAuthSuccess(response);
        }),
        catchError(error => {
          this.setError(error.message);
          return throwError(error);
        }),
        tap(() => this.setLoading(false))
      );
  }

  /**
   * User logout
   */
  logout(logoutAllDevices = false): Observable<any> {
    const refreshToken = this.getCurrentRefreshToken();
    
    // Solución: aseguramos que refreshToken sea undefined si es null, para cumplir con el tipo LogoutRequest
    const logoutRequest: LogoutRequest = {
      refreshToken: refreshToken ?? undefined,
      logoutAllDevices
    };

    return this.apiService.post('/auth/logout', logoutRequest)
      .pipe(
        tap(() => this.handleLogout()),
        catchError(error => {
          // Even if logout fails on server, clear local session
          this.handleLogout();
          return of(null);
        })
      );
  }

  /**
   * Refresh access token
   */
  refreshToken(): Observable<RefreshTokenResponse> {
    const refreshToken = this.getCurrentRefreshToken();
    
    if (!refreshToken) {
      return throwError('No refresh token available');
    }

    const refreshRequest: RefreshTokenRequest = { refreshToken };

    return this.apiService.post<RefreshTokenResponse>('/auth/refresh', refreshRequest)
      .pipe(
        tap(response => {
          this.handleTokenRefresh(response);
        }),
        catchError(error => {
          this.handleRefreshError(error);
          return throwError(error);
        })
      );
  }

  /**
   * Forgot password
   */
  forgotPassword(email: string): Observable<any> {
    const request: ForgotPasswordRequest = { email };
    
    return this.apiService.post('/auth/forgot-password', request);
  }

  /**
   * Reset password
   */
  resetPassword(token: string, password: string, confirmPassword: string): Observable<any> {
    const request: ResetPasswordRequest = { token, password, confirmPassword };
    
    return this.apiService.post('/auth/reset-password', request);
  }

  /**
   * Change password
   */
  changePassword(currentPassword: string, newPassword: string, confirmPassword: string): Observable<any> {
    const request: ChangePasswordRequest = { currentPassword, newPassword, confirmPassword };
    
    return this.apiService.post('/auth/change-password', request);
  }

  /**
   * Verify email
   */
  verifyEmail(token: string): Observable<any> {
    const request: VerifyEmailRequest = { token };
    
    return this.apiService.post('/auth/verify-email', request);
  }

  /**
   * Resend verification email
   */
  resendVerificationEmail(): Observable<any> {
    return this.apiService.post('/auth/resend-verification');
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(): Observable<AuthUser> {
    return this.apiService.get<AuthUser>('/auth/me')
      .pipe(
        tap(user => {
          this.updateAuthState({ user });
        }),
        catchError(error => {
          if (error.status === 401) {
            this.handleLogout();
          }
          return throwError(error);
        })
      );
  }

  /**
   * Update user profile
   */
  updateProfile(userData: Partial<AuthUser>): Observable<AuthUser> {
    return this.apiService.put<AuthUser>('/auth/me', userData)
      .pipe(
        tap(user => {
          this.updateAuthState({ user });
        })
      );
  }

  /**
   * Update user profile (alias for updateProfile)
   */
  updateUserProfile(userData: Partial<AuthUser>): Observable<AuthUser> {
    return this.updateProfile(userData);
  }

  /**
   * Get session information
   */
  getSessionInfo(): Observable<SessionInfo> {
    return this.apiService.get<SessionInfo>('/auth/session');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.authStateSubject.value.isAuthenticated;
  }

  /**
   * Get current user
   */
  getCurrentUserValue(): AuthUser | null {
    return this.authStateSubject.value.user;
  }

  /**
   * Get current access token
   */
  getCurrentAccessToken(): string | null {
    return this.authStateSubject.value.accessToken;
  }

  /**
   * Get current refresh token
   */
  getCurrentRefreshToken(): string | null {
    return this.authStateSubject.value.refreshToken;
  }

  /**
   * Check if user has permission
   */
  hasPermission(permission: string): boolean {
    const user = this.getCurrentUserValue();
    return user?.permissions?.includes(permission) || false;
  }

  /**
   * Check if user has role
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUserValue();
    return user?.roles?.includes(role) || false;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUserValue();
    return roles.some(role => user?.roles?.includes(role)) || false;
  }

  /**
   * Handle successful authentication
   */
  private handleAuthSuccess(response: LoginResponse | RegisterResponse, rememberMe = false): void {
    console.log('🎉 Auth success, response structure:', response);
    
    // El backend envía: { success: true, message: "...", data: { user, accessToken, refreshToken } }
    // El ApiService extrae solo el 'data', así que response ya es el objeto con user, accessToken, etc.
    
    if (!response || !response.accessToken) {
      console.error('❌ Invalid response structure:', response);
      return;
    }

    const tokenPayload = this.decodeToken(response.accessToken);
    
    if (tokenPayload) {
      this.updateAuthState({
        isAuthenticated: true,
        user: response.user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        sessionExpiry: new Date(tokenPayload.exp * 1000).toISOString(),
        lastActivity: new Date().toISOString(),
        error: null
      });

      // Store tokens and user data
      console.log('💾 Storing auth data to localStorage');
      this.storageService.setItem(this.TOKEN_KEY, response.accessToken);
      this.storageService.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
      this.storageService.setItem(this.USER_KEY, JSON.stringify(response.user));
      this.storageService.setItem(this.REMEMBER_ME_KEY, rememberMe.toString());

      // Verify storage
      const storedToken = this.storageService.getItem(this.TOKEN_KEY);
      console.log('✅ Token stored verification:', storedToken ? 'SUCCESS' : 'FAILED');

      // Schedule token refresh
      this.scheduleTokenRefresh(tokenPayload.exp);
    } else {
      console.error('❌ Failed to decode token');
    }
  }

  /**
   * Handle token refresh
   */
  private handleTokenRefresh(response: RefreshTokenResponse): void {
    console.log('🔄 Token refresh response:', response);
    
    if (!response || !response.accessToken) {
      console.error('❌ Invalid refresh response structure:', response);
      return;
    }
    
    const tokenPayload = this.decodeToken(response.accessToken);
    
    if (tokenPayload) {
      this.updateAuthState({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        sessionExpiry: new Date(tokenPayload.exp * 1000).toISOString(),
        lastActivity: new Date().toISOString()
      });

      // Update stored tokens
      this.storageService.setItem(this.TOKEN_KEY, response.accessToken);
      this.storageService.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);

      // Schedule next refresh
      this.scheduleTokenRefresh(tokenPayload.exp);
    } else {
      console.error('❌ Failed to decode refresh token');
    }
  }

  /**
   * Handle logout
   */
  private handleLogout(): void {
    this.updateAuthState({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      sessionExpiry: null,
      lastActivity: null,
      error: null
    });

    // Clear storage
    this.storageService.removeItem(this.TOKEN_KEY);
    this.storageService.removeItem(this.REFRESH_TOKEN_KEY);
    this.storageService.removeItem(this.USER_KEY);
    this.storageService.removeItem(this.REMEMBER_ME_KEY);

    // Clear refresh timer
    if (this.refreshTokenTimer) {
      clearTimeout(this.refreshTokenTimer);
    }

    // Redirect to login
    this.router.navigate(['/login']);
  }

  /**
   * Handle refresh error
   */
  private handleRefreshError(error: any): void {
    console.error('Token refresh failed:', error);
    this.logout();
  }

  /**
   * Schedule token refresh
   */
  private scheduleTokenRefresh(expiryTime: number): void {
    if (this.refreshTokenTimer) {
      clearTimeout(this.refreshTokenTimer);
    }

    const expiryDate = new Date(expiryTime * 1000);
    const refreshTime = expiryDate.getTime() - Date.now() - this.REFRESH_BUFFER_TIME;

    if (refreshTime > 0) {
      this.refreshTokenTimer = setTimeout(() => {
        this.attemptTokenRefresh();
      }, refreshTime);
    }
  }

  /**
   * Attempt to refresh token
   */
  private attemptTokenRefresh(): void {
    this.refreshToken().subscribe({
      next: () => {
        console.log('Token refreshed successfully');
      },
      error: (error) => {
        console.error('Token refresh failed:', error);
      }
    });
  }

  /**
   * Decode JWT token
   */
  private decodeToken(token: string): JwtPayload | null {
    try {
      // Validate token format
      if (!token || token.split('.').length !== 3) {
        console.warn('⚠️ Invalid token format');
        return null;
      }

      const payload = token.split('.')[1];
      
      // Handle base64 padding issues
      const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
      const decodedPayload = atob(paddedPayload);
      
      const parsedPayload = JSON.parse(decodedPayload);
      
      console.log('🔍 Token payload structure:', {
        hasUserId: !!parsedPayload.userId,
        hasSub: !!parsedPayload.sub,
        hasExp: !!parsedPayload.exp,
        hasRole: !!parsedPayload.role,
        hasRoles: !!parsedPayload.roles,
        payload: parsedPayload
      });
      
      // Validate required fields - el backend usa userId en lugar de sub
      if (!parsedPayload.exp || (!parsedPayload.sub && !parsedPayload.userId)) {
        console.warn('⚠️ Token missing required fields (exp or sub/userId)');
        return null;
      }
      
      // Normalizar el payload para que coincida con la interfaz JwtPayload
      const normalizedPayload: JwtPayload = {
        sub: parsedPayload.sub || parsedPayload.userId, // Usar sub o userId
        email: parsedPayload.email || '',
        roles: parsedPayload.roles || (parsedPayload.role ? [parsedPayload.role.name] : []),
        permissions: parsedPayload.permissions || (parsedPayload.role?.permissions ? Object.keys(parsedPayload.role.permissions) : []),
        iat: parsedPayload.iat || 0,
        exp: parsedPayload.exp,
        iss: parsedPayload.iss || 'finsmart-network',
        aud: parsedPayload.aud || 'finsmart-frontend'
      };
      
      console.log('✅ Token decoded and normalized successfully');
      return normalizedPayload;
    } catch (error) {
      console.error('❌ Error decoding token:', error);
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  private isTokenExpired(tokenPayload: JwtPayload): boolean {
    const expiryTime = tokenPayload.exp * 1000;
    return Date.now() >= expiryTime;
  }

  /**
   * Update auth state
   */
  private updateAuthState(updates: Partial<AuthState>): void {
    const currentState = this.authStateSubject.value;
    this.authStateSubject.next({ ...currentState, ...updates });
  }

  /**
   * Clear auth state
   */
  private clearAuthState(): void {
    console.log('🧹 Clearing auth state...');
    
    this.updateAuthState({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      sessionExpiry: null,
      lastActivity: null,
      error: null
    });
    
    // Clear storage
    this.storageService.removeItem(this.TOKEN_KEY);
    this.storageService.removeItem(this.REFRESH_TOKEN_KEY);
    this.storageService.removeItem(this.USER_KEY);
    this.storageService.removeItem(this.REMEMBER_ME_KEY);
    
    // Clear refresh timer
    if (this.refreshTokenTimer) {
      clearTimeout(this.refreshTokenTimer);
    }
    
    console.log('✅ Auth state cleared');
  }

  /**
   * Clear invalid tokens and redirect to login
   */
  clearInvalidTokens(): void {
    console.log('🚨 Clearing invalid tokens...');
    this.clearAuthState();
    this.router.navigate(['/login']);
  }

  /**
   * Set loading state
   */
  private setLoading(isLoading: boolean): void {
    this.updateAuthState({ isLoading });
  }

  /**
   * Set error state
   */
  private setError(error: string): void {
    this.updateAuthState({ error });
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this.updateAuthState({ error: null });
  }

  /**
   * Update last activity
   */
  updateLastActivity(): void {
    this.updateAuthState({ lastActivity: new Date().toISOString() });
  }
} 