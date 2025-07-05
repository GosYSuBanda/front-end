import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_CONFIG } from '../config/api.config';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  roleId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.users}`;

  constructor(private http: HttpClient) { }

  getUserById(userId: string): Observable<User> {
    return this.http.get<{success: boolean, message: string, data: User}>(`${this.apiUrl}/${userId}`).pipe(
      map(response => response.data)
    );
  }

  getUserByEmail(email: string): Observable<User> {
    return this.http.get<{success: boolean, message: string, data: User}>(`${this.apiUrl}/email/${email}`).pipe(
      map(response => response.data)
    );
  }
} 