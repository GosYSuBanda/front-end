import { HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export function httpErrorInterceptor(request: HttpRequest<unknown>, next: HttpHandlerFn) {
  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ha ocurrido un error';
      
      if (error.error instanceof ErrorEvent) {
        // Error del lado del cliente
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Error del lado del servidor
        errorMessage = `Error ${error.status}: ${error.message}`;
        
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        }
      }
      
      console.error('HTTP Error:', error);
      console.error('Error Message:', errorMessage);
      
      return throwError(() => new Error(errorMessage));
    })
  );
} 