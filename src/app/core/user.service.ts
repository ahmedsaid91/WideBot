import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, map, tap, catchError } from 'rxjs/operators';
import { 
  User, 
  UserFilter, 
  PaginatedResponse, 
  UserStatistics 
} from './user.model';

/**
 * User Service
 * 
 * Manages user data with full CRUD operations.
 * Uses RxJS BehaviorSubject for centralized state management.
 * Integrates with json-server for mock backend API.
 * 
 * Features:
 * - CRUD operations (Create, Read, Update, Delete)
 * - Reactive state management with BehaviorSubject
 * - Filtering, searching, and pagination
 * - User statistics for analytics
 * - Optimistic UI updates
 * - Undo functionality for delete operations
 * 
 * State Management Pattern:
 * - Single source of truth using BehaviorSubject
 * - All components subscribe to this service for data
 * - Automatic updates to all subscribers when data changes
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {
  // Backend API URL
  private readonly API_URL = 'http://localhost:3000/users';

  // Central state for users using BehaviorSubject
  private usersState$ = new BehaviorSubject<User[]>([]);
  private loadingState$ = new BehaviorSubject<boolean>(false);
  private lastDeletedUser: { user: User; index: number } | null = null;
  
  // Local mock data (commented out - using json-server instead)
  // Uncomment if you want to use local data without backend
  /*
  private mockUsers: User[] = [
    {
      id: 1,
      username: 'johndoe',
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'admin',
      status: 'active',
      phone: '+1 (555) 123-4567',
      address: '123 Main St, New York, NY 10001',
      dateOfBirth: '1985-03-15',
      department: 'Engineering',
      joinDate: '2020-01-15',
      avatar: 'https://i.pravatar.cc/150?u=john.doe@example.com',
      lastActive: new Date().toISOString()
    },
    {
      id: 2,
      username: 'janesmith',
      email: 'jane.smith@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'user',
      status: 'active',
      phone: '+1 (555) 234-5678',
      address: '456 Oak Ave, Los Angeles, CA 90001',
      dateOfBirth: '1990-07-22',
      department: 'Marketing',
      joinDate: '2021-03-20',
      avatar: 'https://i.pravatar.cc/150?u=jane.smith@example.com',
      lastActive: new Date().toISOString()
    },
    {
      id: 3,
      username: 'mikejohnson',
      email: 'mike.johnson@example.com',
      firstName: 'Mike',
      lastName: 'Johnson',
      role: 'user',
      status: 'active',
      phone: '+1 (555) 345-6789',
      address: '789 Pine Rd, Chicago, IL 60601',
      dateOfBirth: '1988-11-10',
      department: 'Sales',
      joinDate: '2019-08-10',
      avatar: 'https://i.pravatar.cc/150?u=mike.johnson@example.com',
      lastActive: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 4,
      username: 'sarahwilliams',
      email: 'sarah.williams@example.com',
      firstName: 'Sarah',
      lastName: 'Williams',
      role: 'user',
      status: 'active',
      phone: '+1 (555) 456-7890',
      address: '321 Elm St, Houston, TX 77001',
      dateOfBirth: '1992-05-18',
      department: 'HR',
      joinDate: '2022-01-05',
      avatar: 'https://i.pravatar.cc/150?u=sarah.williams@example.com',
      lastActive: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 5,
      username: 'davidbrown',
      email: 'david.brown@example.com',
      firstName: 'David',
      lastName: 'Brown',
      role: 'user',
      status: 'inactive',
      phone: '+1 (555) 567-8901',
      address: '654 Maple Dr, Phoenix, AZ 85001',
      dateOfBirth: '1987-09-25',
      department: 'Finance',
      joinDate: '2020-11-12',
      avatar: 'https://i.pravatar.cc/150?u=david.brown@example.com',
      lastActive: new Date(Date.now() - 2592000000).toISOString()
    },
    {
      id: 6,
      username: 'emilydavis',
      email: 'emily.davis@example.com',
      firstName: 'Emily',
      lastName: 'Davis',
      role: 'admin',
      status: 'active',
      phone: '+1 (555) 678-9012',
      address: '987 Cedar Ln, Philadelphia, PA 19019',
      dateOfBirth: '1991-02-14',
      department: 'IT',
      joinDate: '2021-06-18',
      avatar: 'https://i.pravatar.cc/150?u=emily.davis@example.com',
      lastActive: new Date().toISOString()
    },
    {
      id: 7,
      username: 'robertmiller',
      email: 'robert.miller@example.com',
      firstName: 'Robert',
      lastName: 'Miller',
      role: 'user',
      status: 'active',
      phone: '+1 (555) 789-0123',
      address: '147 Birch Ct, San Antonio, TX 78201',
      dateOfBirth: '1986-12-03',
      department: 'Operations',
      joinDate: '2018-04-22',
      avatar: 'https://i.pravatar.cc/150?u=robert.miller@example.com',
      lastActive: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 8,
      username: 'lisawilson',
      email: 'lisa.wilson@example.com',
      firstName: 'Lisa',
      lastName: 'Wilson',
      role: 'user',
      status: 'active',
      phone: '+1 (555) 890-1234',
      address: '258 Spruce St, San Diego, CA 92101',
      dateOfBirth: '1993-08-30',
      department: 'Marketing',
      joinDate: '2022-09-15',
      avatar: 'https://i.pravatar.cc/150?u=lisa.wilson@example.com',
      lastActive: new Date().toISOString()
    },
    {
      id: 9,
      username: 'jamesmoore',
      email: 'james.moore@example.com',
      firstName: 'James',
      lastName: 'Moore',
      role: 'user',
      status: 'inactive',
      phone: '+1 (555) 901-2345',
      address: '369 Willow Way, Dallas, TX 75201',
      dateOfBirth: '1989-04-07',
      department: 'Sales',
      joinDate: '2019-12-01',
      avatar: 'https://i.pravatar.cc/150?u=james.moore@example.com',
      lastActive: new Date(Date.now() - 5184000000).toISOString()
    },
    {
      id: 10,
      username: 'mariatailor',
      email: 'maria.taylor@example.com',
      firstName: 'Maria',
      lastName: 'Taylor',
      role: 'user',
      status: 'active',
      phone: '+1 (555) 012-3456',
      address: '741 Ash Ave, San Jose, CA 95101',
      dateOfBirth: '1994-06-19',
      department: 'Engineering',
      joinDate: '2023-02-10',
      avatar: 'https://i.pravatar.cc/150?u=maria.taylor@example.com',
      lastActive: new Date(Date.now() - 1800000).toISOString()
    }
  ];
  
  private nextId = 11; // For generating new IDs
  */

  constructor(private http: HttpClient) {
    // Initialize by loading users from API
    this.loadUsers();
  }

  /**
   * Gets all users as an Observable
   * Components subscribe to this for reactive updates
   */
  getUsers(): Observable<User[]> {
    return this.usersState$.asObservable();
  }

  /**
   * Gets loading state as an Observable
   */
  getLoadingState(): Observable<boolean> {
    return this.loadingState$.asObservable();
  }

  /**
   * Gets current users synchronously
   */
  getCurrentUsers(): User[] {
    return this.usersState$.value;
  }

  /**
   * Loads all users from the API
   * Updates the central state
   */
  loadUsers(): void {
    this.loadingState$.next(true);
    
    // BACKEND CALL - Using json-server
    this.http.get<User[]>(this.API_URL).pipe(
      catchError(error => {
        console.error('Error loading users:', error);
        this.loadingState$.next(false);
        return of([]);
      })
    ).subscribe(users => {
      this.usersState$.next(users);
      this.loadingState$.next(false);
    });
  }

  /**
   * Gets a single user by ID
   * 
   * @param id - User ID
   * @returns Observable<User>
   */
  getUserById(id: number): Observable<User> {
    // First check local state
    const user = this.usersState$.value.find(u => u.id === id);
    if (user) {
      return of(user);
    }
    
    // If not in state, fetch from API
    return this.http.get<User>(`${this.API_URL}/${id}`);
  }

  /**
   * Creates a new user
   * Implements optimistic UI update
   * 
   * @param user - User data (without ID)
   * @returns Observable<User> with created user
   */
  createUser(user: Omit<User, 'id'>): Observable<User> {
    this.loadingState$.next(true);

    return this.http.post<User>(this.API_URL, user).pipe(
      tap(newUser => {
        // Optimistic update: add new user to state immediately
        const currentUsers = this.usersState$.value;
        this.usersState$.next([...currentUsers, newUser]);
        this.loadingState$.next(false);
      }),
      catchError(error => {
        this.loadingState$.next(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Updates an existing user
   * Implements optimistic UI update
   * 
   * @param id - User ID
   * @param user - Updated user data
   * @returns Observable<User> with updated user
   */
  updateUser(id: number, user: Partial<User>): Observable<User> {
    this.loadingState$.next(true);

    // Store original state for rollback if needed
    const originalUsers = [...this.usersState$.value];
    const userIndex = originalUsers.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      this.loadingState$.next(false);
      return throwError(() => new Error('User not found'));
    }

    // Optimistic update
    const updatedUser = { ...originalUsers[userIndex], ...user };
    const optimisticUsers = [...originalUsers];
    optimisticUsers[userIndex] = updatedUser;
    this.usersState$.next(optimisticUsers);

    return this.http.put<User>(`${this.API_URL}/${id}`, updatedUser).pipe(
      tap(serverUser => {
        // Update with server response
        const currentUsers = this.usersState$.value;
        const idx = currentUsers.findIndex(u => u.id === id);
        if (idx !== -1) {
          const finalUsers = [...currentUsers];
          finalUsers[idx] = serverUser;
          this.usersState$.next(finalUsers);
        }
        this.loadingState$.next(false);
      }),
      catchError(error => {
        // Rollback on error
        this.usersState$.next(originalUsers);
        this.loadingState$.next(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Deletes a user
   * Stores deleted user for undo functionality
   * 
   * @param id - User ID to delete
   * @returns Observable<void>
   */
  deleteUser(id: number): Observable<void> {
    this.loadingState$.next(true);

    const currentUsers = this.usersState$.value;
    const userIndex = currentUsers.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      this.loadingState$.next(false);
      return throwError(() => new Error('User not found'));
    }

    // Store for undo functionality
    this.lastDeletedUser = {
      user: currentUsers[userIndex],
      index: userIndex
    };

    // Optimistic delete
    const optimisticUsers = currentUsers.filter(u => u.id !== id);
    this.usersState$.next(optimisticUsers);

    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      tap(() => {
        this.loadingState$.next(false);
      }),
      catchError(error => {
        // Rollback on error
        this.usersState$.next(currentUsers);
        this.lastDeletedUser = null;
        this.loadingState$.next(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Undoes the last delete operation
   * Restores the deleted user
   * 
   * @returns Observable<User> | null
   */
  undoDelete(): Observable<User> | null {
    if (!this.lastDeletedUser) {
      return null;
    }

    const { user } = this.lastDeletedUser;
    this.lastDeletedUser = null;

    // Re-create the user via API
    return this.createUser(user);
  }

  /**
   * Filters users based on criteria
   * 
   * @param filter - Filter criteria
   * @returns Filtered users array
   */
  filterUsers(filter: UserFilter): User[] {
    let filtered = this.usersState$.value;

    if (filter.searchTerm) {
      const searchLower = filter.searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.username.toLowerCase().includes(searchLower)
      );
    }

    if (filter.role) {
      filtered = filtered.filter(user => user.role === filter.role);
    }

    if (filter.status) {
      filtered = filtered.filter(user => user.status === filter.status);
    }

    if (filter.department) {
      filtered = filtered.filter(user => user.department === filter.department);
    }

    return filtered;
  }

  /**
   * Gets paginated users
   * 
   * @param page - Page number (1-indexed)
   * @param pageSize - Number of items per page
   * @param filter - Optional filter criteria
   * @returns Paginated response with users
   */
  getPaginatedUsers(
    page: number = 1,
    pageSize: number = 10,
    filter?: UserFilter
  ): Observable<PaginatedResponse<User>> {
    return this.getUsers().pipe(
      map(users => {
        // Apply filters if provided
        let filtered = filter ? this.filterUsers(filter) : users;
        
        // Calculate pagination
        const total = filtered.length;
        const totalPages = Math.ceil(total / pageSize);
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const data = filtered.slice(start, end);

        return {
          data,
          total,
          page,
          pageSize,
          totalPages
        };
      })
    );
  }

  /**
   * Gets user statistics for analytics dashboard
   * 
   * @returns Observable<UserStatistics>
   */
  getUserStatistics(): Observable<UserStatistics> {
    return this.getUsers().pipe(
      map(users => {
        const totalUsers = users.length;
        const activeUsers = users.filter(u => u.status === 'active').length;
        const inactiveUsers = users.filter(u => u.status === 'inactive').length;

        // Users by department
        const usersByDepartment: { [key: string]: number } = {};
        users.forEach(user => {
          if (user.department) {
            usersByDepartment[user.department] = (usersByDepartment[user.department] || 0) + 1;
          }
        });

        // Users by role
        const usersByRole: { [key: string]: number } = {};
        users.forEach(user => {
          usersByRole[user.role] = (usersByRole[user.role] || 0) + 1;
        });

        // Recent registrations (last 5)
        const recentRegistrations = [...users]
          .sort((a, b) => {
            if (!a.joinDate || !b.joinDate) return 0;
            return new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime();
          })
          .slice(0, 5);

        return {
          totalUsers,
          activeUsers,
          inactiveUsers,
          usersByDepartment,
          usersByRole,
          recentRegistrations
        };
      })
    );
  }

  /**
   * Gets all unique departments
   * 
   * @returns Array of department names
   */
  getDepartments(): Observable<string[]> {
    return this.getUsers().pipe(
      map(users => {
        const departments = users
          .map(u => u.department)
          .filter((dept): dept is string => !!dept);
        return [...new Set(departments)].sort();
      })
    );
  }
}

