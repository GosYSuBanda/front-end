import { environment } from '../../environments/environment';

export const API_CONFIG = {
  baseUrl: environment.apiUrl,
  endpoints: {
    posts: '/posts',
    users: '/users',
    invoices: '/invoices',
    contacts: '/contacts',
    friendRequests: '/friend-requests'
  }
}; 