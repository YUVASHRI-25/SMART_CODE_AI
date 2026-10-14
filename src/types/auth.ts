export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  joinedAt?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
