import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  
  /**
   * Set item in localStorage with validation
   */
  setItem(key: string, value: string): void {
    try {
      // Special validation for tokens
      if (key.includes('token') && value) {
        if (!this.isValidToken(value)) {
          console.warn('⚠️ Attempting to store invalid token:', key);
          return;
        }
      }
      
      localStorage.setItem(key, value);
      console.log('💾 Stored item:', key, value ? 'SUCCESS' : 'EMPTY');
    } catch (error) {
      console.error('❌ Error storing item:', key, error);
    }
  }

  /**
   * Get item from localStorage
   */
  getItem(key: string): string | null {
    try {
      const value = localStorage.getItem(key);
      
      // Special validation for tokens
      if (key.includes('token') && value) {
        if (!this.isValidToken(value)) {
          console.warn('⚠️ Invalid token found in storage:', key);
          this.removeItem(key);
          return null;
        }
      }
      
      return value;
    } catch (error) {
      console.error('❌ Error retrieving item:', key, error);
      return null;
    }
  }

  /**
   * Remove item from localStorage
   */
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
      console.log('🗑️ Removed item:', key);
    } catch (error) {
      console.error('❌ Error removing item:', key, error);
    }
  }

  /**
   * Clear all localStorage
   */
  clear(): void {
    try {
      localStorage.clear();
      console.log('🧹 Cleared all localStorage');
    } catch (error) {
      console.error('❌ Error clearing localStorage:', error);
    }
  }

  /**
   * Check if token has valid format
   */
  private isValidToken(token: string): boolean {
    if (!token || typeof token !== 'string') {
      return false;
    }
    
    // Check JWT format (3 parts separated by dots)
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }
    
    // Check if parts are not empty
    if (!parts[0] || !parts[1] || !parts[2]) {
      return false;
    }
    
    return true;
  }

  /**
   * Get all auth-related keys
   */
  getAuthKeys(): string[] {
    return [
      'finsmart_access_token',
      'finsmart_refresh_token', 
      'finsmart_user_data',
      'finsmart_remember_me'
    ];
  }

  /**
   * Clear all auth-related data
   */
  clearAuthData(): void {
    const authKeys = this.getAuthKeys();
    authKeys.forEach(key => this.removeItem(key));
    console.log('🔐 Cleared all auth data');
  }
} 