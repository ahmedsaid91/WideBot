/**
 * User Model Interface
 * Represents a user entity in the system with all relevant properties
 */
export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  department?: string;
  joinDate?: string;
  avatar?: string;
  lastActive?: string;
}

/**
 * User Role Enum
 * Defines the available roles in the system
 */
export type UserRole = 'admin' | 'user';

/**
 * User Status Enum
 * Defines the possible user statuses
 */
export type UserStatus = 'active' | 'inactive';

/**
 * Login Credentials Interface
 * Used for authentication requests
 */
export interface LoginCredentials {
  username: string;
  password: string;
}

/**
 * Authentication Response Interface
 * Returned after successful authentication
 */
export interface AuthResponse {
  user: User;
  token: string;
  expiresIn: number;
}

/**
 * Auth State Interface
 * Represents the current authentication state
 */
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isImpersonating: boolean;
  originalUser: User | null;
}

/**
 * User Statistics Interface
 * Used for analytics dashboard
 */
export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  usersByDepartment: { [key: string]: number };
  usersByRole: { [key: string]: number };
  recentRegistrations: User[];
}

/**
 * User Filter Interface
 * Used for filtering and searching users
 */
export interface UserFilter {
  searchTerm?: string;
  role?: UserRole;
  status?: UserStatus;
  department?: string;
}

/**
 * Paginated Response Interface
 * Generic interface for paginated data
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

