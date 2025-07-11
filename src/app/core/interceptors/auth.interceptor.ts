import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<any> => {
  const authService = inject(AuthService);
  
  console.log('🔗 Auth interceptor called for:', req.url);

  // Don't add token to auth endpoints
  if (isAuthEndpoint(req.url)) {
    console.log('⏭️ Skipping auth for endpoint:', req.url);
    return next(req);
  }

  // Si ya tiene Authorization header, no hacer nada
  if (req.headers.has('Authorization')) {
    console.log('🔑 Request already has Authorization header');
    return next(req);
  }

  // Add token to request solo si no es FormData (que ya maneja el ApiService)
  const token = authService.getCurrentAccessToken();
  let authenticatedReq = req;
  
  if (token && !isFormDataRequest(req)) {
    console.log('🔑 Adding token to request:', req.url);
    authenticatedReq = addTokenToRequest(req, token);
  } else if (token && isFormDataRequest(req)) {
    console.log('📎 FormData request detected, token handled by ApiService');
  } else {
    console.log('⚠️ No token available for request:', req.url);
  }

  return next(authenticatedReq).pipe(
    catchError(error => {
      console.log('❌ Request error:', error.status, req.url);
      if (error.status === 401 && !isAuthEndpoint(req.url)) {
        console.log('🔄 Handling 401 error, attempting token refresh');
        return handle401Error(req, next, authService);
      }
      
      return throwError(() => error);
    })
  );
};

function addTokenToRequest(request: HttpRequest<any>, token: string): HttpRequest<any> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

function isFormDataRequest(request: HttpRequest<any>): boolean {
  return request.body instanceof FormData;
}

function handle401Error(request: HttpRequest<any>, next: HttpHandlerFn, authService: AuthService): Observable<any> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap((response: any) => {
        isRefreshing = false;
        refreshTokenSubject.next(response.accessToken);
        return next(addTokenToRequest(request, response.accessToken));
      }),
      catchError((error) => {
        isRefreshing = false;
        authService.logout();
        return throwError(() => error);
      })
    );
  }

  return refreshTokenSubject.pipe(
    filter(token => token !== null),
    take(1),
    switchMap((token) => next(addTokenToRequest(request, token)))
  );
}

function isAuthEndpoint(url: string): boolean {
  const authEndpoints = [
    '/auth/login',
    '/auth/register', 
    '/auth/refresh',
    '/auth/forgot-password',
    '/auth/reset-password'
  ];
  
  return authEndpoints.some(endpoint => url.includes(endpoint));
} 