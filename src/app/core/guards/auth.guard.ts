import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.authService.isAuthenticated$.pipe(
      take(1),
      map(isAuthenticated => {
        console.log('🔒 AuthGuard check - isAuthenticated:', isAuthenticated);
        
        if (isAuthenticated) {
          // Additional check for valid token
          const token = localStorage.getItem('finsmart_access_token');
          if (!token || token.split('.').length !== 3) {
            console.warn('⚠️ AuthGuard: Invalid token detected, redirecting to login');
            this.authService.clearInvalidTokens();
            return false;
          }
          
          console.log('✅ AuthGuard: Access granted');
          return true;
        } else {
          console.log('❌ AuthGuard: Access denied, redirecting to login');
          this.router.navigate(['/login']);
          return false;
        }
      })
    );
  }
} 