import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly PREFIX = 'finsmart_';
  
  constructor() {
    this.checkStorageSupport();
  }

  /**
   * Check if storage is supported
   */
  private checkStorageSupport(): void {
    if (!this.isLocalStorageAvailable()) {
      console.warn('localStorage is not available');
    }
    
    if (!this.isSessionStorageAvailable()) {
      console.warn('sessionStorage is not available');
    }
  }

  /**
   * Check if localStorage is available
   */
  private isLocalStorageAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Check if sessionStorage is available
   */
  private isSessionStorageAvailable(): boolean {
    try {
      const test = '__session_test__';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Get item from localStorage
   */
  getItem(key: string, useSession = false): string | null {
    try {
      const storage = useSession ? sessionStorage : localStorage;
      const fullKey = this.PREFIX + key;
      return storage.getItem(fullKey);
    } catch (e) {
      console.error('Error getting item from storage:', e);
      return null;
    }
  }

  /**
   * Set item in localStorage
   */
  setItem(key: string, value: string, useSession = false): void {
    try {
      const storage = useSession ? sessionStorage : localStorage;
      const fullKey = this.PREFIX + key;
      storage.setItem(fullKey, value);
    } catch (e) {
      console.error('Error setting item in storage:', e);
    }
  }

  /**
   * Remove item from localStorage
   */
  removeItem(key: string, useSession = false): void {
    try {
      const storage = useSession ? sessionStorage : localStorage;
      const fullKey = this.PREFIX + key;
      storage.removeItem(fullKey);
    } catch (e) {
      console.error('Error removing item from storage:', e);
    }
  }

  /**
   * Clear all items with our prefix
   */
  clear(useSession = false): void {
    try {
      const storage = useSession ? sessionStorage : localStorage;
      const keys = Object.keys(storage);
      
      keys.forEach(key => {
        if (key.startsWith(this.PREFIX)) {
          storage.removeItem(key);
        }
      });
    } catch (e) {
      console.error('Error clearing storage:', e);
    }
  }

  /**
   * Get object from storage
   */
  getObject<T>(key: string, useSession = false): T | null {
    try {
      const item = this.getItem(key, useSession);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error('Error parsing object from storage:', e);
      return null;
    }
  }

  /**
   * Set object in storage
   */
  setObject(key: string, value: any, useSession = false): void {
    try {
      const serialized = JSON.stringify(value);
      this.setItem(key, serialized, useSession);
    } catch (e) {
      console.error('Error serializing object to storage:', e);
    }
  }

  /**
   * Check if key exists in storage
   */
  hasKey(key: string, useSession = false): boolean {
    const fullKey = this.PREFIX + key;
    const storage = useSession ? sessionStorage : localStorage;
    return storage.getItem(fullKey) !== null;
  }

  /**
   * Get all keys with our prefix
   */
  getAllKeys(useSession = false): string[] {
    try {
      const storage = useSession ? sessionStorage : localStorage;
      const keys = Object.keys(storage);
      
      return keys
        .filter(key => key.startsWith(this.PREFIX))
        .map(key => key.substring(this.PREFIX.length));
    } catch (e) {
      console.error('Error getting all keys:', e);
      return [];
    }
  }

  /**
   * Get storage size in bytes
   */
  getStorageSize(useSession = false): number {
    try {
      const storage = useSession ? sessionStorage : localStorage;
      let size = 0;
      
      for (const key in storage) {
        if (key.startsWith(this.PREFIX)) {
          size += storage[key].length + key.length;
        }
      }
      
      return size;
    } catch (e) {
      console.error('Error calculating storage size:', e);
      return 0;
    }
  }

  /**
   * Export all data
   */
  exportData(useSession = false): any {
    try {
      const storage = useSession ? sessionStorage : localStorage;
      const data: any = {};
      
      for (const key in storage) {
        if (key.startsWith(this.PREFIX)) {
          const cleanKey = key.substring(this.PREFIX.length);
          data[cleanKey] = storage[key];
        }
      }
      
      return data;
    } catch (e) {
      console.error('Error exporting data:', e);
      return {};
    }
  }

  /**
   * Import data
   */
  importData(data: any, useSession = false): void {
    try {
      Object.keys(data).forEach(key => {
        this.setItem(key, data[key], useSession);
      });
    } catch (e) {
      console.error('Error importing data:', e);
    }
  }

  /**
   * Set item with expiration
   */
  setItemWithExpiry(key: string, value: string, expiryMinutes: number, useSession = false): void {
    const now = new Date();
    const expiryTime = now.getTime() + (expiryMinutes * 60 * 1000);
    
    const item = {
      value: value,
      expiry: expiryTime
    };
    
    this.setObject(key, item, useSession);
  }

  /**
   * Get item with expiration check
   */
  getItemWithExpiry(key: string, useSession = false): string | null {
    const item = this.getObject<{value: string, expiry: number}>(key, useSession);
    
    if (!item) {
      return null;
    }
    
    const now = new Date();
    
    if (now.getTime() > item.expiry) {
      this.removeItem(key, useSession);
      return null;
    }
    
    return item.value;
  }

  /**
   * Clean expired items
   */
  cleanExpiredItems(useSession = false): void {
    const keys = this.getAllKeys(useSession);
    
    keys.forEach(key => {
      const item = this.getObject<{value: string, expiry: number}>(key, useSession);
      
      if (item && item.expiry) {
        const now = new Date();
        
        if (now.getTime() > item.expiry) {
          this.removeItem(key, useSession);
        }
      }
    });
  }

  /**
   * Get available storage space
   */
  getAvailableSpace(useSession = false): number {
    try {
      const storage = useSession ? sessionStorage : localStorage;
      const maxSize = 5 * 1024 * 1024; // 5MB typical limit
      const currentSize = this.getStorageSize(useSession);
      
      return Math.max(0, maxSize - currentSize);
    } catch (e) {
      console.error('Error calculating available space:', e);
      return 0;
    }
  }

  /**
   * Check if storage is nearly full
   */
  isStorageNearlyFull(useSession = false, threshold = 0.9): boolean {
    try {
      const maxSize = 5 * 1024 * 1024; // 5MB typical limit
      const currentSize = this.getStorageSize(useSession);
      
      return (currentSize / maxSize) >= threshold;
    } catch (e) {
      console.error('Error checking storage fullness:', e);
      return false;
    }
  }
} 