import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { 
  User, 
  LoginCredentials, 
  AuthResponse, 
  AuthState 
} from './user.model';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Static credentials for demo
  private readonly CREDENTIALS = {
    admin: { username: 'admin', password: 'admin123', role: 'admin' as const },
    user: { username: 'user', password: 'user123', role: 'user' as const }
  };

  // Mock user data
  private readonly MOCK_USERS = {
    admin: {
      id: 1,
      username: 'admin',
      email: 'admin@widebot.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin' as const,
      status: 'active' as const,
      phone: '+201234567890',
      address: '123 Admin Street, Cairo, Egypt',
      department: 'Management',
      avatar: 'https://i.pravatar.cc/150?img=1'
    },
    user: {
      id: 2,
      username: 'user',
      email: 'user@widebot.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'user' as const,
      status: 'active' as const,
      phone: '+201234567891',
      address: '456 User Lane, Cairo, Egypt',
      department: 'Engineering',
      avatar: 'https://i.pravatar.cc/150?img=2'
    }
  };

  // Auth state management using BehaviorSubject for reactive updates
  private authState$ = new BehaviorSubject<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isImpersonating: false,
    originalUser: null
  });

  constructor(private router: Router) {
    // Restore session from localStorage on service initialization
    this.restoreSession();
  }

  /**
   * Gets the current auth state as an Observable
   * Components can subscribe to this for reactive updates
   */
  getAuthState(): Observable<AuthState> {
    return this.authState$.asObservable();
  }

  /**
   * Gets the current auth state value synchronously
   */
  getCurrentAuthState(): AuthState {
    return this.authState$.value;
  }

  /**
   * Gets the current authenticated user
   */
  getCurrentUser(): User | null {
    return this.authState$.value.user;
  }

  /**
   * Checks if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.authState$.value.isAuthenticated;
  }

  /**
   * Checks if current user has admin role
   */
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }

  /**
   * Checks if user is currently impersonating another user
   */
  isImpersonating(): boolean {
    return this.authState$.value.isImpersonating;
  }

  /**
   * Login method with static credentials
   * Simulates API call with delay and returns JWT token
   * 
   * @param credentials - Username and password
   * @returns Observable<AuthResponse> with user data and token
   */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    // Validate credentials
    const validCredential = Object.values(this.CREDENTIALS).find(
      cred => cred.username === credentials.username && cred.password === credentials.password
    );

    if (!validCredential) {
      return throwError(() => new Error('Invalid username or password'));
    }

    // Simulate API delay
    return of(validCredential).pipe(
      delay(800), // Simulate network delay
      map(cred => {
        const user = this.MOCK_USERS[cred.role];
        const token = this.generateMockToken(user);
        const expiresIn = 3600; // 1 hour in seconds

        return {
          user,
          token,
          expiresIn
        };
      }),
      tap(response => {
        // Update auth state
        this.setAuthState({
          user: response.user,
          token: response.token,
          isAuthenticated: true,
          isImpersonating: false,
          originalUser: null
        });

        // Persist to localStorage
        this.saveSession(response);
      })
    );
  }

  /**
   * Logout method
   * Clears auth state and redirects to login
   */
  logout(): void {
    // Clear auth state
    this.authState$.next({
      user: null,
      token: null,
      isAuthenticated: false,
      isImpersonating: false,
      originalUser: null
    });

    // Clear localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_expires');

    // Redirect to login
    this.router.navigate(['/login']);
  }

  /**
   * Impersonate user (admin only)
   * Allows admin to switch to a user's view without logging out
   * 
   * @param user - User to impersonate
   */
  impersonateUser(user: User): void {
    const currentState = this.authState$.value;
    
    if (!currentState.user || currentState.user.role !== 'admin') {
      throw new Error('Only admins can impersonate users');
    }

    // Save original admin user if not already impersonating
    const originalUser = currentState.isImpersonating 
      ? currentState.originalUser 
      : currentState.user;

    // Update auth state with impersonated user
    this.setAuthState({
      user,
      token: currentState.token,
      isAuthenticated: true,
      isImpersonating: true,
      originalUser
    });
  }

  /**
   * Stop impersonation and return to original admin user
   */
  stopImpersonation(): void {
    const currentState = this.authState$.value;
    
    if (!currentState.isImpersonating || !currentState.originalUser) {
      return;
    }

    // Restore original admin user
    this.setAuthState({
      user: currentState.originalUser,
      token: currentState.token,
      isAuthenticated: true,
      isImpersonating: false,
      originalUser: null
    });
  }

  /**
   * Generates a mock JWT token
   * In a real app, this would be returned from the backend
   */
  private generateMockToken(user: User): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ 
      sub: user.id, 
      username: user.username,
      role: user.role,
      iat: Date.now(),
      exp: Date.now() + 3600000 // 1 hour
    }));
    const signature = btoa('mock-signature');
    
    return `${header}.${payload}.${signature}`;
  }

  /**
   * Saves authentication session to localStorage
   */
  private saveSession(response: AuthResponse): void {
    const expiresAt = Date.now() + (response.expiresIn * 1000);
    
    localStorage.setItem('auth_token', response.token);
    localStorage.setItem('auth_user', JSON.stringify(response.user));
    localStorage.setItem('auth_expires', expiresAt.toString());
  }

  /**
   * Restores authentication session from localStorage
   * Called on service initialization
   */
  private restoreSession(): void {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('auth_user');
    const expiresStr = localStorage.getItem('auth_expires');

    if (!token || !userStr || !expiresStr) {
      return;
    }

    // Check if token has expired
    const expiresAt = parseInt(expiresStr, 10);
    if (Date.now() > expiresAt) {
      this.logout();
      return;
    }

    try {
      const user = JSON.parse(userStr);
      this.setAuthState({
        user,
        token,
        isAuthenticated: true,
        isImpersonating: false,
        originalUser: null
      });
    } catch (error) {
      console.error('Failed to restore session:', error);
      this.logout();
    }
  }

  /**
   * Updates the auth state and notifies all subscribers
   */
  private setAuthState(state: AuthState): void {
    this.authState$.next(state);
  }
}
