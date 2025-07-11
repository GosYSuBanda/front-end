import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse, HttpResponse, HttpEventType } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import { map, catchError, tap, retry, delay, filter } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse, PaginatedResponse, ErrorResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = environment.apiUrl || 'http://localhost:3000/api';
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000;

  // Loading state management
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Generic GET request
   */
  get<T>(endpoint: string, params?: any, options?: any): Observable<T> {
    const httpOptions = this.createHttpOptions(options);
    
    if (params) {
      httpOptions.params = this.createHttpParams(params);
    }

    return this.makeRequest<T>(() => 
      this.http.get<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, { ...httpOptions, observe: 'response' })
        .pipe(
          filter(event => event.type === HttpEventType.Response),
          map(event => {
            const response = (event as HttpResponse<ApiResponse<T>>).body;
            return response?.data as T;
          }),
          retry(this.maxRetries),
          catchError(this.handleError)
        )
    );
  }

  /**
   * Generic POST request
   */
  post<T>(endpoint: string, data?: any, options?: any): Observable<T> {
    const fullUrl = `${this.baseUrl}${endpoint}`;
    const isFormData = data instanceof FormData;
    
    // Crear headers base sin valores undefined
    let headers: any = {};
    
    // Solo agregar Authorization si tenemos token
    const authToken = this.getAuthToken();
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    // Para FormData, NO establecer Content-Type
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    
    const httpOptions = {
      headers: headers,
      ...options
    };
    
    console.log('📤 Making POST request:', { 
      url: fullUrl, 
      isFormData,
      headers: httpOptions.headers
    });
    
    return this.makeRequest<T>(() =>
      this.http.post<any>(fullUrl, data, { ...httpOptions, observe: 'response' })
        .pipe(
          filter(event => event.type === HttpEventType.Response),
          map(event => {
            const response = (event as HttpResponse<any>).body;
            console.log('📥 POST response received:', response);
            
            // Para FormData, devolver la respuesta completa
            if (isFormData) {
              return response as T;
            }
            
            // Para otros tipos, extraer solo data
            return response?.data as T;
          }),
          catchError(this.handleError)
        )
    );
  }

  /**
   * Generic PUT request
   */
  put<T>(endpoint: string, data?: any, options?: any): Observable<T> {
    const httpOptions = this.createHttpOptions(options);
    
    return this.makeRequest<T>(() =>
      this.http.put<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, data, { ...httpOptions, observe: 'response' })
        .pipe(
          filter(event => event.type === HttpEventType.Response),
          map(event => {
            const response = (event as HttpResponse<ApiResponse<T>>).body;
            return response?.data as T;
          }),
          catchError(this.handleError)
        )
    );
  }

  /**
   * Generic PATCH request
   */
  patch<T>(endpoint: string, data?: any, options?: any): Observable<T> {
    const httpOptions = this.createHttpOptions(options);
    
    return this.makeRequest<T>(() =>
      this.http.patch<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, data, { ...httpOptions, observe: 'response' })
        .pipe(
          filter(event => event.type === HttpEventType.Response),
          map(event => {
            const response = (event as HttpResponse<ApiResponse<T>>).body;
            return response?.data as T;
          }),
          catchError(this.handleError)
        )
    );
  }

  /**
   * Generic DELETE request
   */
  delete<T>(endpoint: string, options?: any): Observable<T> {
    const httpOptions = this.createHttpOptions(options);
    
    return this.makeRequest<T>(() =>
      this.http.delete<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, { ...httpOptions, observe: 'response' })
        .pipe(
          filter(event => event.type === HttpEventType.Response),
          map(event => {
            const response = (event as HttpResponse<ApiResponse<T>>).body;
            return response?.data as T;
          }),
          catchError(this.handleError)
        )
    );
  }

  /**
   * Paginated GET request
   */
  getPaginated<T>(endpoint: string, params?: any, options?: any): Observable<PaginatedResponse<T>> {
    const httpOptions = this.createHttpOptions(options);
    
    if (params) {
      httpOptions.params = this.createHttpParams(params);
    }

    return this.makeRequest<PaginatedResponse<T>>(() =>
      this.http.get<ApiResponse<PaginatedResponse<T>>>(`${this.baseUrl}${endpoint}`, { ...httpOptions, observe: 'response' })
        .pipe(
          filter(event => event.type === HttpEventType.Response),
          map(event => {
            const response = (event as HttpResponse<ApiResponse<PaginatedResponse<T>>>).body;
            return response?.data as PaginatedResponse<T>;
          }),
          retry(this.maxRetries),
          catchError(this.handleError)
        )
    );
  }

  /**
   * File upload request
   */
  uploadFile<T>(endpoint: string, file: File, additionalData?: any, options?: any): Observable<T> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        if (additionalData[key] !== null && additionalData[key] !== undefined) {
          formData.append(key, additionalData[key]);
        }
      });
    }

    const httpOptions = this.createHttpOptions(options);
    // Remove Content-Type header for file uploads to let browser set it
    delete httpOptions.headers?.['Content-Type'];

    return this.makeRequest<T>(() =>
      this.http.post<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, formData, { ...httpOptions, observe: 'response' })
        .pipe(
          filter(event => event.type === HttpEventType.Response),
          map(event => {
            const response = (event as HttpResponse<ApiResponse<T>>).body;
            return response?.data as T;
          }),
          catchError(this.handleError)
        )
    );
  }

  /**
   * Multiple file upload request
   */
  uploadFiles<T>(endpoint: string, files: File[], additionalData?: any, options?: any): Observable<T> {
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append(`files`, file);
    });
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        if (additionalData[key] !== null && additionalData[key] !== undefined) {
          formData.append(key, additionalData[key]);
        }
      });
    }

    const httpOptions = this.createHttpOptions(options);
    delete httpOptions.headers?.['Content-Type'];

    return this.makeRequest<T>(() =>
      this.http.post<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, formData, { ...httpOptions, observe: 'response' })
        .pipe(
          filter(event => event.type === HttpEventType.Response),
          map(event => {
            const response = (event as HttpResponse<ApiResponse<T>>).body;
            return response?.data as T;
          }),
          catchError(this.handleError)
        )
    );
  }

  /**
   * Download file request
   */
  downloadFile(endpoint: string, params?: any): Observable<Blob> {
    const httpOptions = {
      responseType: 'blob' as 'blob',
      params: params ? this.createHttpParams(params) : undefined,
      observe: 'response' as 'response'
    };

    return this.makeRequest<Blob>(() =>
      this.http.get(`${this.baseUrl}${endpoint}`, httpOptions)
        .pipe(
          filter(event => event.type === HttpEventType.Response),
          map(event => (event as HttpResponse<Blob>).body as Blob),
          catchError(this.handleError)
        )
    );
  }

  /**
   * Check if API is healthy
   */
  healthCheck(): Observable<boolean> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/health`, { observe: 'response' })
      .pipe(
        filter(event => event.type === HttpEventType.Response),
        map(event => (event as HttpResponse<ApiResponse<any>>).body?.success || false),
        catchError(() => of(false))
      );
  }

  /**
   * Set loading state
   */
  setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  /**
   * Get current loading state
   */
  isLoading(): boolean {
    return this.loadingSubject.value;
  }

  /**
   * Create HTTP options
   */
  private createHttpOptions(options?: any): any {
    const defaultOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return { ...defaultOptions, ...options };
  }

  /**
   * Create HTTP params
   */
  private createHttpParams(params: any): HttpParams {
    let httpParams = new HttpParams();
    
    Object.keys(params).forEach(key => {
      const value = params[key];
      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(item => {
            httpParams = httpParams.append(key, item.toString());
          });
        } else {
          httpParams = httpParams.append(key, value.toString());
        }
      }
    });

    return httpParams;
  }

  /**
   * Make request with loading state management
   */
  private makeRequest<T>(requestFn: () => Observable<T>): Observable<T> {
    this.setLoading(true);
    
    return requestFn().pipe(
      tap(() => this.setLoading(false)),
      catchError(error => {
        this.setLoading(false);
        return throwError(error);
      })
    );
  }

  /**
   * Handle HTTP errors
   */
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    console.error('🚨 HTTP Error occurred:', {
      status: error.status,
      statusText: error.statusText,
      url: error.url,
      error: error.error
    });

    let errorMessage = 'Ha ocurrido un error desconocido';
    let errorCode = 'UNKNOWN_ERROR';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error de cliente: ${error.error.message}`;
      errorCode = 'CLIENT_ERROR';
      console.error('🔥 Client-side error:', error.error.message);
    } else {
      // Server-side error
      const serverError = error.error as ErrorResponse;
      
      // Si el servidor envía un error en formato ApiResponse
      if (serverError && typeof serverError === 'object') {
        console.error('🔥 Server error response:', serverError);
        
        if (serverError.message) {
          errorMessage = serverError.message;
          errorCode = serverError.error || 'SERVER_ERROR';
        } else if (serverError.success === false) {
          errorMessage = 'Error en el servidor';
          errorCode = 'SERVER_ERROR';
        }
      } else {
        // Error HTTP estándar
        switch (error.status) {
          case 0:
            errorMessage = 'No se puede conectar al servidor. Verifica tu conexión.';
            errorCode = 'CONNECTION_ERROR';
            break;
          case 400:
            errorMessage = 'Solicitud incorrecta';
            errorCode = 'BAD_REQUEST';
            break;
          case 401:
            errorMessage = 'Token de acceso requerido';
            errorCode = 'UNAUTHORIZED';
            break;
          case 403:
            errorMessage = 'Acceso prohibido';
            errorCode = 'FORBIDDEN';
            break;
          case 404:
            errorMessage = 'Recurso no encontrado';
            errorCode = 'NOT_FOUND';
            break;
          case 429:
            errorMessage = 'Demasiadas solicitudes';
            errorCode = 'TOO_MANY_REQUESTS';
            break;
          case 500:
            errorMessage = 'Error interno del servidor';
            errorCode = 'INTERNAL_SERVER_ERROR';
            break;
          case 503:
            errorMessage = 'Servicio no disponible';
            errorCode = 'SERVICE_UNAVAILABLE';
            break;
          default:
            errorMessage = `Error ${error.status}: ${error.message}`;
            errorCode = `HTTP_${error.status}`;
        }
      }
    }

    console.error('❌ Final error details:', {
      code: errorCode,
      message: errorMessage,
      status: error.status,
      error: error.error
    });

    return throwError({
      code: errorCode,
      message: errorMessage,
      status: error.status,
      details: error.error
    });
  };

  private getAuthToken(): string | null {
    try {
      return localStorage.getItem('finsmart_access_token');
    } catch {
      return null;
    }
  }
} 