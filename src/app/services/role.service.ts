import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

export interface Role {
  _id: string;
  name: string;
  permissions: {
    createPost: boolean;
    comment: boolean;
    react: boolean;
    deleteOwnPost: boolean;
    deleteAnyPost: boolean;
    startChat: boolean;
    viewAnalytics: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface RolesResponse {
  success: boolean;
  message: string;
  data: Role[];
}

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  constructor(private http: HttpClient) {}

  getRoles(): Observable<RolesResponse> {
    return this.http.get<RolesResponse>(`${API_CONFIG.baseUrl}/roles`);
  }
} 