import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  roleId?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authState = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null
  });

  constructor() {
    // Check if user is already logged in (from localStorage)
    this.loadStoredAuth();
  }

  // Get current auth state as observable
  getAuthState(): Observable<AuthState> {
    return this.authState.asObservable();
  }

  // Get current user ID
  getCurrentUserId(): string | null {
    return this.authState.value.user?._id || null;
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.authState.value.user;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.authState.value.isAuthenticated;
  }

  // Login user
  login(user: User, token: string): void {
    const authState: AuthState = {
      isAuthenticated: true,
      user,
      token
    };
    
    this.authState.next(authState);
    this.saveAuthToStorage(authState);
  }

  // Logout user
  logout(): void {
    const authState: AuthState = {
      isAuthenticated: false,
      user: null,
      token: null
    };
    
    this.authState.next(authState);
    this.clearStoredAuth();
  }

  // Save auth to localStorage
  private saveAuthToStorage(authState: AuthState): void {
    localStorage.setItem('finsmart_auth', JSON.stringify(authState));
  }

  // Load auth from localStorage
  private loadStoredAuth(): void {
    const stored = localStorage.getItem('finsmart_auth');
    if (stored) {
      try {
        const authState = JSON.parse(stored);
        this.authState.next(authState);
      } catch (error) {
        console.error('Error loading stored auth:', error);
        this.clearStoredAuth();
      }
    }
  }

  // Clear stored auth
  private clearStoredAuth(): void {
    localStorage.removeItem('finsmart_auth');
  }
} 