import { AuthenticatedUser } from '../users/users.types';

export interface JwtPayload {
  sub: string;
  email: string;
}

export interface AuthResult {
  user: AuthenticatedUser;
  access_token: string;
}

export interface RegisterBody {
  email: string;
  password: string;
  name: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface UserResponse {
  user: AuthenticatedUser;
}

export interface LogoutResponse {
  message: string;
}
