# Local Mock Data Setup

## Overview

The application now uses **local mock data with RxJS** instead of backend API calls. All backend calls have been **commented out** and can be easily re-enabled when the backend is ready.

## Changes Made

### 1. **User Service (`src/app/core/user.service.ts`)**

#### Mock Data Added
- **10 sample users** with complete profiles including:
  - Admin users (John Doe, Emily Davis)
  - Regular users (Jane Smith, Mike Johnson, Sarah Williams, etc.)
  - Various departments (Engineering, Marketing, Sales, HR, Finance, IT, Operations)
  - Active and inactive statuses
  - Realistic timestamps for `lastActive` field

#### Methods Updated

All CRUD operations now work with local data:

| Method | Local Implementation | Backend (Commented) |
|--------|---------------------|---------------------|
| `loadUsers()` | Uses `of(this.mockUsers)` with 300ms delay | `http.get<User[]>(API_URL)` |
| `getUserById(id)` | Finds in local state with 100ms delay | `http.get<User>(API_URL/${id})` |
| `createUser(user)` | Adds to `mockUsers` array, auto-generates ID | `http.post<User>(API_URL, user)` |
| `updateUser(id, user)` | Updates `mockUsers` array with 500ms delay | `http.put<User>(API_URL/${id}, user)` |
| `deleteUser(id)` | Removes from `mockUsers` with 300ms delay | `http.delete<void>(API_URL/${id})` |
| `undoDelete()` | Restores user to `mockUsers` at original index | Re-creates via `createUser()` |

#### Key Features Preserved
✅ **Optimistic UI updates** - UI updates immediately
✅ **Error rollback** - State reverts on failure
✅ **Undo functionality** - Delete can be undone
✅ **Loading states** - Simulated network delays
✅ **BehaviorSubject state management** - Reactive state updates

### 2. **User Model (`src/app/core/user.model.ts`)**

Added `lastActive?: string` field to the `User` interface to track when users were last active.

## How It Works

### State Management with RxJS

```typescript
// Central state using BehaviorSubject
private usersState$ = new BehaviorSubject<User[]>([]);

// Components subscribe to get reactive updates
getUsers(): Observable<User[]> {
  return this.usersState$.asObservable();
}
```

### Data Flow

1. **Initialization**: On service creation, `loadUsers()` is called
2. **Mock Data Loading**: `of(this.mockUsers)` creates an Observable from the array
3. **Simulated Delay**: `.pipe(delay(300))` simulates network latency
4. **State Update**: `this.usersState$.next(users)` updates all subscribers
5. **Component Updates**: All subscribed components automatically re-render

### CRUD Operations

#### Create
```typescript
// Generate new ID
const newUser: User = { ...user, id: this.nextId++ };

// Add to mock data
this.mockUsers.push(newUser);

// Update reactive state
this.usersState$.next([...currentUsers, newUser]);
```

#### Update
```typescript
// Update mock array
this.mockUsers[mockIndex] = updatedUser;

// Update reactive state (optimistic)
this.usersState$.next(optimisticUsers);
```

#### Delete
```typescript
// Remove from mock array
this.mockUsers.splice(mockIndex, 1);

// Update reactive state (optimistic)
this.usersState$.next(optimisticUsers);

// Store for undo
this.lastDeletedUser = { user, index };
```

#### Undo Delete
```typescript
// Restore to mock array at original position
this.mockUsers.splice(index, 0, user);

// Update reactive state
this.usersState$.next([...currentUsers]);
```

## Benefits

### 1. **No Backend Required**
- ✅ App works immediately without running `json-server`
- ✅ Perfect for development and demos
- ✅ No network dependencies

### 2. **Fully Reactive with RxJS**
- ✅ All components automatically update when data changes
- ✅ Uses `BehaviorSubject` for state management
- ✅ Follows reactive programming patterns

### 3. **Realistic Behavior**
- ✅ Simulated network delays (100-500ms)
- ✅ Loading states work correctly
- ✅ Error handling preserved

### 4. **Easy Backend Migration**
- ✅ All backend code is commented, not removed
- ✅ Clear `TODO` comments for when backend is ready
- ✅ Just uncomment backend calls and remove local data

## When Backend is Ready

### Step 1: Uncomment Backend Calls

For each method, **uncomment** the backend section:

```typescript
// BACKEND CALL - Uncomment when backend is ready
// return this.http.get<User[]>(this.API_URL).pipe(
//   catchError(error => {
//     console.error('Error loading users:', error);
//     this.loadingState$.next(false);
//     return of([]);
//   })
// ).subscribe(users => {
//   this.usersState$.next(users);
//   this.loadingState$.next(false);
// });
```

### Step 2: Remove Local Data Code

**Comment out or delete** the local data sections:

```typescript
// USING LOCAL MOCK DATA - Comment this out when backend is ready
of(this.mockUsers).pipe(
  delay(300)
).subscribe(users => {
  this.usersState$.next(users);
  this.loadingState$.next(false);
});
```

### Step 3: Remove Mock Data Array

Delete or comment out:

```typescript
// Local mock data - Remove this when backend is ready
private mockUsers: User[] = [ /* ... */ ];
private nextId = 11;
```

### Step 4: Restore API URL

Uncomment:

```typescript
private readonly API_URL = 'http://localhost:3000/users';
```

## Testing the Application

### 1. **Start the Development Server**
```bash
npm start
```

### 2. **Login Credentials**
- **Admin**: username: `admin`, password: `admin123`
- **User**: username: `user`, password: `user123`

### 3. **Test Features**

#### Admin Features
- ✅ View user list with pagination
- ✅ Search and filter users
- ✅ Add new user (ID auto-increments from 11)
- ✅ Edit existing user
- ✅ Delete user with undo
- ✅ View analytics dashboard
- ✅ Impersonate users

#### User Features
- ✅ View profile
- ✅ Edit profile (coming soon)

### 4. **Verify Data Persistence**

⚠️ **Note**: Data is stored in memory and will reset on page refresh. To persist data:
- Option 1: Use `localStorage` (implement in future)
- Option 2: Connect to backend API
- Option 3: Use IndexedDB

## Mock Users Overview

| ID | Name | Role | Department | Status |
|----|------|------|------------|--------|
| 1 | John Doe | Admin | Engineering | Active |
| 2 | Jane Smith | User | Marketing | Active |
| 3 | Mike Johnson | User | Sales | Active |
| 4 | Sarah Williams | User | HR | Active |
| 5 | David Brown | User | Finance | Inactive |
| 6 | Emily Davis | Admin | IT | Active |
| 7 | Robert Miller | User | Operations | Active |
| 8 | Lisa Wilson | User | Marketing | Active |
| 9 | James Moore | User | Sales | Inactive |
| 10 | Maria Taylor | User | Engineering | Active |

## RxJS Patterns Used

### 1. **BehaviorSubject for State**
```typescript
private usersState$ = new BehaviorSubject<User[]>([]);
```
- Stores current state
- Emits current value to new subscribers
- All components share same state

### 2. **Observable Streams**
```typescript
getUsers(): Observable<User[]> {
  return this.usersState$.asObservable();
}
```
- Read-only access to state
- Prevents external modifications
- Components subscribe for updates

### 3. **Operators**
```typescript
of(data).pipe(
  delay(300),
  tap(result => { /* side effects */ }),
  catchError(error => { /* error handling */ })
)
```
- `of()` - Creates Observable from value
- `delay()` - Simulates network latency
- `tap()` - Side effects without modifying stream
- `catchError()` - Error handling

### 4. **Optimistic Updates**
```typescript
// 1. Update UI immediately
this.usersState$.next(optimisticData);

// 2. Make API call (or simulate)
return observable.pipe(
  // 3. On success: keep optimistic update
  tap(result => { /* success */ }),
  // 4. On error: rollback
  catchError(error => {
    this.usersState$.next(originalData);
    return throwError(error);
  })
);
```

## Architecture Benefits

### ✅ Separation of Concerns
- Service handles data logic
- Components handle presentation
- Clear boundaries

### ✅ Testability
- Service can be easily mocked
- State changes are predictable
- Observables can be tested with marble diagrams

### ✅ Scalability
- Easy to add more data sources
- Can combine multiple streams
- Supports complex data flows

### ✅ Maintainability
- Single source of truth
- Clear data flow
- Easy to debug

## Next Steps

1. ✅ **Local data working** - Current state
2. 🔄 **Implement user profile editing**
3. 🔄 **Add localStorage persistence** (optional)
4. 🔄 **Connect to real backend** (when available)
5. 🔄 **Add more analytics features**

---

## Summary

The application now uses **local mock data with RxJS BehaviorSubject** for state management. All backend API calls are preserved as comments for easy migration. The reactive architecture ensures all components automatically update when data changes, providing a smooth user experience without requiring a backend server.

**Key Achievement**: Full CRUD functionality with reactive state management, optimistic UI updates, and undo capability - all working without a backend! 🎉

