import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private readonly maxRetries = 2;
  private readonly retryableStatusCodes = [500, 502, 503, 504];

  constructor(private router: Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      retry(this.shouldRetry(request) ? this.maxRetries : 0),
      catchError((error: HttpErrorResponse) => {
        return this.handleError(error, request);
      })
    );
  }

  private shouldRetry(request: HttpRequest<any>): boolean {
    // Only retry GET requests
    return request.method === 'GET';
  }

  private handleError(error: HttpErrorResponse, request: HttpRequest<any>): Observable<never> {
    let errorMessage = 'Ha ocurrido un error';
    let userMessage = 'Algo salió mal. Por favor intenta de nuevo.';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error del cliente: ${error.error.message}`;
      userMessage = 'Error de conexión. Verifica tu conexión a internet.';
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = 'Solicitud incorrecta';
          userMessage = 'Los datos proporcionados no son válidos.';
          break;
        case 401:
          errorMessage = 'No autorizado';
          userMessage = 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.';
          if (!request.url.includes('/auth/')) {
            this.router.navigate(['/auth/login']);
          }
          break;
        case 403:
          errorMessage = 'Acceso prohibido';
          userMessage = 'No tienes permisos para realizar esta acción.';
          this.router.navigate(['/unauthorized']);
          break;
        case 404:
          errorMessage = 'Recurso no encontrado';
          userMessage = 'El recurso solicitado no fue encontrado.';
          break;
        case 409:
          errorMessage = 'Conflicto';
          userMessage = 'Ya existe un recurso con estos datos.';
          break;
        case 422:
          errorMessage = 'Error de validación';
          userMessage = 'Los datos proporcionados no son válidos.';
          break;
        case 429:
          errorMessage = 'Demasiadas solicitudes';
          userMessage = 'Has realizado demasiadas solicitudes. Intenta más tarde.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor';
          userMessage = 'Error del servidor. Nuestro equipo ha sido notificado.';
          break;
        case 502:
          errorMessage = 'Bad Gateway';
          userMessage = 'El servidor no está disponible temporalmente.';
          break;
        case 503:
          errorMessage = 'Servicio no disponible';
          userMessage = 'El servicio está en mantenimiento. Intenta más tarde.';
          break;
        case 504:
          errorMessage = 'Tiempo de espera agotado';
          userMessage = 'El servidor tardó demasiado en responder. Intenta más tarde.';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.message}`;
          userMessage = 'Ha ocurrido un error inesperado.';
      }

      // Try to extract server error message
      if (error.error && error.error.message) {
        if (typeof error.error.message === 'string') {
          userMessage = error.error.message;
        } else if (Array.isArray(error.error.message)) {
          userMessage = error.error.message[0];
        }
      }
    }

    // Log error for debugging
    console.error('HTTP Error:', {
      status: error.status,
      statusText: error.statusText,
      message: errorMessage,
      url: request.url,
      method: request.method,
      error: error.error
    });

    // Show user-friendly notification
    this.showErrorNotification(userMessage, error.status);

    // Return error with user-friendly message
    return throwError({
      ...error,
      userMessage,
      timestamp: new Date().toISOString()
    });
  }

  private showErrorNotification(message: string, status: number): void {
    // This would typically show a toast notification
    // For now, we'll just log it
    console.warn('Error notification:', message, 'Status:', status);
    
    // In a real app, you might use a notification service:
    // this.notificationService.showError(message);
  }
} 