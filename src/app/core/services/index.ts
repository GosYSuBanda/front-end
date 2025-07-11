// Core Services
export * from './api.service';
export * from './auth.service';
export * from './storage.service';

// Feature Services
export * from './post.service';
export * from './user.service';
export * from './message.service';
export * from './search.service';

// Service array for providers
export const CORE_SERVICES = [
  // Core services are provided in root by default
];

// Service interfaces for dependency injection
export interface ICoreServices {
  api: any;
  auth: any;
  storage: any;
  post: any;
  user: any;
  message: any;
  search: any;
} 