// Environment configuration
declare const window: any;

export const environment = {
  production: false,
  apiUrl: getApiUrl()
};

function getApiUrl(): string {
  
  // En Docker o producción, usar path relativo (Nginx hace proxy)
  return '/api';
} 