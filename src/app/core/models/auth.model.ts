export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  roleId: string;
  confirmPassword?: string;
  acceptTerms?: boolean;
  businessInfo?: {
    companyName: string;
    ruc?: string;
    sector?: string;
    size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  };
}

export interface RegisterResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  verificationEmailSent: boolean;
}

export interface AuthUser {
  _id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
  isVerified: boolean;
  isActive: boolean;
  roles: string[];
  permissions: string[];
  metrics?: {
    totalPosts: number;
    totalConnections: number;
    totalLikes: number;
    totalShares: number;
    profileViews: number;
  };
  businessInfo?: {
    companyName: string;
    ruc?: string;
    sector?: string;
    size?: string;
    logo?: string;
  };
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    notifications: boolean;
  };
  lastLogin?: string;
  createdAt: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
  emailSent: boolean;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
  success: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface VerifyEmailResponse {
  message: string;
  success: boolean;
  user?: AuthUser;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  lastActivity: string | null;
  sessionExpiry: string | null;
}

export interface JwtPayload {
  sub: string; // user ID
  email: string;
  roles: string[];
  permissions: string[];
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

export interface AuthError {
  code: string;
  message: string;
  details?: any;
}

export interface SessionInfo {
  isActive: boolean;
  expiresAt: string;
  deviceInfo?: {
    browser: string;
    os: string;
    device: string;
    ip: string;
  };
  lastActivity: string;
}

export interface LogoutRequest {
  refreshToken?: string;
  logoutAllDevices?: boolean;
}

export interface LogoutResponse {
  message: string;
  success: boolean;
} 