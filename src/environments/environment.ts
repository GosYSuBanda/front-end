// Environment configuration
declare const window: any;

export const environment = {
  production: false,
  apiUrl: getApiUrl()
};

function getApiUrl(): string {
  
  return 'http://localhost:3000/api';
} 