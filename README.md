# Advanced User Management System

**A comprehensive Angular 18 application with role-based access control, advanced user management, and analytics.**

[![Angular](https://img.shields.io/badge/Angular-18-red)](https://angular.io/)
[![PrimeNG](https://img.shields.io/badge/PrimeNG-18-blue)](https://primeng.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Authentication](#authentication)
- [Architecture Decisions](#architecture-decisions)
- [Development Guidelines](#development-guidelines)

## 🎯 Overview

This is an enterprise-grade user management system built with Angular 18, showcasing advanced frontend development practices including:
- Role-based access control (RBAC)
- Reactive state management with RxJS
- Comprehensive CRUD operations
- Real-time analytics dashboard
- Internationalization (i18n) support
- Performance optimization techniques
- Clean architecture and design patterns

## ✨ Features

### Authentication & Authorization
- ✅ Static login with predefined credentials
- ✅ JWT token simulation
- ✅ Session persistence with localStorage
- ✅ Automatic token expiration handling
- ✅ Role-based route protection
- ✅ Auth and Role guards

### Admin Features
- 🚧 User management dashboard with analytics
- 🚧 Paginated and searchable user list
- 🚧 Advanced CRUD operations
  - Add user with reactive forms
  - Edit user with pre-filled data
  - Delete user with undo functionality
- 🚧 User impersonation feature
- 🚧 Analytics with charts (user statistics)

### User Features
- 🚧 User profile management
- 🚧 View and edit profile details

### Technical Features
- ✅ **JSON Server backend** - Full REST API with persistent data
- ✅ Centralized state management using RxJS BehaviorSubjects
- ✅ Optimistic UI updates with rollback on errors
- ✅ Undo functionality for delete operations
- ✅ Global error handling with interceptors
- ✅ Responsive SCSS design
- ✅ PrimeNG component library integration
- ✅ Localization (EN/AR) with ngx-translate
- ✅ ESLint configuration
- ✅ Performance optimizations (OnPush, trackBy)

Legend: ✅ Completed | 🚧 In Progress | ⏳ Pending

## 🛠 Tech Stack

### Core
- **Angular 18** - Modern web framework
- **TypeScript 5.5** - Type-safe development
- **RxJS 7.8** - Reactive programming

### UI Framework
- **PrimeNG 18** - Comprehensive UI component library
- **PrimeFlex** - CSS utility framework
- **PrimeIcons** - Icon library

### State Management
- **RxJS BehaviorSubject** - Centralized reactive state management

### Development Tools
- **json-server** - Mock REST API backend
- **ESLint** - Code quality and consistency
- **Angular CLI** - Project scaffolding and build tools

### Data Options
- **Current**: json-server REST API (persistent data in `db.json`)
- **Alternative**: Local mock data with RxJS (see [LOCAL_DATA_SETUP.md](./LOCAL_DATA_SETUP.md))

### Testing (Optional)
- **Jasmine** - Testing framework
- **Karma** - Test runner

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Angular CLI 18

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd task-1
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the JSON Server (Backend API)**

Open a terminal and run:
```bash
npm run api
```
This will start json-server on `http://localhost:3000`

4. **Start the Angular development server**

In a **separate terminal**, run:
```bash
npm start
```
Navigate to `http://localhost:4200`

> **Note**: The app uses **json-server** as a mock backend API. Make sure to run both servers!
> 
> See [JSON_SERVER_SETUP.md](./JSON_SERVER_SETUP.md) for detailed setup instructions.

### Quick Start (Both Servers)

**Windows PowerShell:**
```powershell
Start-Process npm -ArgumentList "run api"
Start-Process npm -ArgumentList "start"
```

**Unix/Mac:**
```bash
npm run dev
```

### Optional: Use Local Mock Data Instead

If you prefer to use local data without a backend:

1. See [LOCAL_DATA_SETUP.md](./LOCAL_DATA_SETUP.md) for instructions
2. Uncomment local data in `src/app/core/user.service.ts`
3. Comment out API calls

### Demo Credentials

**Admin Account:**
- Username: `admin`
- Password: `admin123`

**User Account:**
- Username: `user`
- Password: `user123`

## 📁 Project Structure

```
src/
├── app/
│   ├── core/                      # Core services and guards
│   │   ├── auth.service.ts       # Authentication service with JWT simulation
│   │   ├── auth.guard.ts         # Route authentication guard
│   │   ├── role.guard.ts         # Role-based access guard
│   │   ├── user.service.ts       # User CRUD operations with RxJS
│   │   ├── user.model.ts         # User interfaces and types
│   │   ├── error.interceptor.ts  # HTTP error interceptor
│   │   └── error-handling.service.ts # Global error handling
│   │
│   ├── features/                  # Feature modules
│   │   ├── auth/
│   │   │   └── login/            # Login component with reactive forms
│   │   ├── admin/
│   │   │   ├── admin-dashboard/  # Admin dashboard with analytics
│   │   │   ├── user-list/        # Paginated user list with table
│   │   │   └── user-dialog/      # User add/edit dialog
│   │   └── user/
│   │       └── user-dashboard/   # User profile dashboard
│   │
│   ├── shared/                    # Shared components and utilities
│   │   └── header/               # Application header with navigation
│   │
│   ├── app.component.ts          # Root component
│   ├── app.routes.ts             # Application routes with guards
│   └── app.config.ts             # Application configuration
│
├── styles.scss                    # Global styles with PrimeNG theme
└── db.json                        # Mock database for json-server
```

## 🔐 Authentication

### Static Credentials

The application uses static credentials for demonstration purposes:

| Role  | Username | Password  | Permissions |
|-------|----------|-----------|-------------|
| Admin | admin    | admin123  | Full access to user management, analytics, impersonation |
| User  | user     | user123   | Access to personal profile only |

### Authentication Flow

1. User enters credentials in login form
2. `AuthService.login()` validates credentials
3. Mock JWT token generated and stored in localStorage
4. User redirected based on role (admin → `/admin`, user → `/user`)
5. Auth guards protect routes
6. Session automatically restored on page refresh
7. Token expiration handled automatically

### Authorization

Route protection implemented using functional guards:

- **authGuard**: Ensures user is authenticated
- **roleGuard**: Verifies user has required role

Example route configuration:
```typescript
{
  path: 'admin',
  component: AdminDashboardComponent,
  canActivate: [authGuard, roleGuard],
  data: { roles: ['admin'] }
}
```

## 🏗 Architecture Decisions

### 1. State Management Strategy

**Decision:** Use RxJS BehaviorSubject for centralized state management

**Rationale:**
- Native to Angular, no additional libraries needed
- Reactive and observable-based
- Single source of truth pattern
- Automatic updates to all subscribers
- Lightweight and performant

**Implementation:**
```typescript
// UserService maintains central state
private usersState$ = new BehaviorSubject<User[]>([]);

// Components subscribe for reactive updates
getUsers(): Observable<User[]> {
  return this.usersState$.asObservable();
}
```

### 2. Component Architecture

**Decision:** Standalone components with explicit imports

**Rationale:**
- Modern Angular 18 approach
- Better tree-shaking and bundle size
- Clearer dependencies
- Easier to test and maintain

### 3. Form Validation

**Decision:** Reactive Forms with custom validators

**Rationale:**
- Type-safe
- Easier to test
- Better for complex validation logic
- Supports dynamic form controls

### 4. Error Handling

**Decision:** Centralized error handling with HTTP interceptor

**Rationale:**
- Single point of error processing
- Consistent user experience
- Automatic 401 handling (logout)
- Easy to extend and maintain

### 5. Styling Strategy

**Decision:** SCSS with CSS custom properties and PrimeNG

**Rationale:**
- Component-scoped styles prevent conflicts
- CSS variables for theming
- Responsive design with media queries
- PrimeNG for consistent UI components

### 6. Performance Optimization

**Decisions Implemented:**
- OnPush change detection (planned)
- TrackBy functions for ngFor (planned)
- Lazy loading for feature modules (planned)
- Optimistic UI updates
- Debounced search inputs

### 7. API Integration

**Decision:** json-server for mock backend

**Rationale:**
- Full REST API without backend development
- Easy to extend and modify
- RESTful conventions
- Supports relationships and filtering

## 👨‍💻 Development Guidelines

### Code Quality Standards

1. **TypeScript Strict Mode**
   - Use explicit types
   - Avoid `any` type
   - Enable strict null checks

2. **Component Structure**
   - Single responsibility principle
   - Smart vs Presentational components
   - Lifecycle hooks order: OnInit, OnDestroy, etc.

3. **RxJS Best Practices**
   - Always unsubscribe (use takeUntil pattern)
   - Avoid nested subscriptions
   - Use operators for transformation

4. **Error Handling**
   - Use error handling service
   - Provide user-friendly messages
   - Log errors for debugging

### Running Tests

```bash
npm test
```

### Running Linter

```bash
npm run lint
```

### Building for Production

```bash
npm run build
```

Production build will be in `dist/` directory.

## 📊 State Management Pattern

### User State Flow

```
[UserService] → BehaviorSubject<User[]>
       ↓
[Components] subscribe() → receive updates
       ↓
User action (CRUD)
       ↓
[UserService] updates BehaviorSubject
       ↓
All subscribed components auto-update
```

### Auth State Flow

```
Login → AuthService.login()
     ↓
Store token & user in localStorage
     ↓
Update authState$ BehaviorSubject
     ↓
Components receive auth updates
     ↓
Guards check authentication
```

## 🎨 Design Patterns Used

1. **Singleton Pattern** - Services with `providedIn: 'root'`
2. **Observer Pattern** - RxJS Observables and BehaviorSubjects
3. **Guard Pattern** - Route protection with guards
4. **Interceptor Pattern** - HTTP error interception
5. **Strategy Pattern** - Different validation strategies
6. **Facade Pattern** - Service layer abstracts complexity

## 🔄 Optimistic UI Updates

The application implements optimistic UI updates for better user experience:

1. **Create**: Immediately add to list before server confirms
2. **Update**: Show changes instantly, rollback if error
3. **Delete**: Remove immediately, restore if error

Example:
```typescript
updateUser(id: number, user: Partial<User>): Observable<User> {
  // Store original for rollback
  const originalUsers = [...this.usersState$.value];
  
  // Optimistic update
  this.usersState$.next(updatedUsers);
  
  return this.http.put<User>(`${API}/${id}`, user).pipe(
    catchError(error => {
      // Rollback on error
      this.usersState$.next(originalUsers);
      return throwError(() => error);
    })
  );
}
```

## 🌐 Internationalization (Planned)

The application will support English and Arabic languages using Angular i18n or ngx-translate.

## 📈 Performance Considerations

1. **Change Detection**: OnPush strategy for components
2. **Lazy Loading**: Feature modules loaded on demand
3. **TrackBy**: Efficient list rendering
4. **Bundle Optimization**: Tree-shaking and minification
5. **Caching**: LocalStorage for session persistence

## 🤝 Contributing

This is a demonstration project for a Senior Frontend Developer position at Widebot.

## 📝 License

This project is part of a technical assessment.

## 👨‍💻 Author

**Sr. Frontend Developer Candidate**
- Position: Senior Frontend Developer at Widebot
- Technologies: Angular 18, TypeScript, RxJS, PrimeNG

## 📞 Support

For questions regarding this assessment, please contact the Widebot HR team.

---

**Note:** This is an ongoing development project. Check the Features section for implementation status.
