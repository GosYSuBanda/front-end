import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from '../config/api.config';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  roleId?: string;
  status?: string;
  emailVerified?: boolean;
  lastLogin?: string;
  preferences?: {
    language: string;
    currency: string;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

export interface SignupRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  roleId: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authState = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null
  });

  constructor(private http: HttpClient) {
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

  // Login user with API
  loginWithAPI(loginData: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API_CONFIG.baseUrl}/users/sign-in`, loginData);
  }

  // Login user (internal method)
  login(user: User): void {
    const authState: AuthState = {
      isAuthenticated: true,
      user
    };
    
    this.authState.next(authState);
    this.saveAuthToStorage(authState);
  }

  // Logout user
  logout(): void {
    const authState: AuthState = {
      isAuthenticated: false,
      user: null
    };
    
    this.authState.next(authState);
    this.clearStoredAuth();
  }

  // Signup user
  signup(signupData: SignupRequest): Observable<any> {
    return this.http.post(`${API_CONFIG.baseUrl}/users/sign-up`, signupData);
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