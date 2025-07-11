import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate, CanActivateChild {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    return this.checkRole(route);
  }

  canActivateChild(route: ActivatedRouteSnapshot): Observable<boolean> {
    return this.checkRole(route);
  }

  private checkRole(route: ActivatedRouteSnapshot): Observable<boolean> {
    const requiredRoles = route.data['roles'] as string[];
    const requiredPermissions = route.data['permissions'] as string[];
    
    if (!requiredRoles && !requiredPermissions) {
      return of(true);
    }

    return this.authService.user$.pipe(
      map(user => {
        if (!user) {
          this.router.navigate(['/auth/login']);
          return false;
        }

        // Check roles
        if (requiredRoles && requiredRoles.length > 0) {
          const hasRole = requiredRoles.some(role => user.roles.includes(role));
          if (!hasRole) {
            this.router.navigate(['/unauthorized']);
            return false;
          }
        }

        // Check permissions
        if (requiredPermissions && requiredPermissions.length > 0) {
          const hasPermission = requiredPermissions.some(permission => 
            user.permissions.includes(permission)
          );
          if (!hasPermission) {
            this.router.navigate(['/unauthorized']);
            return false;
          }
        }

        return true;
      })
    );
  }
} 