import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { UserDashboardComponent } from './features/user/user-dashboard/user-dashboard.component';
import { AdminDashboardComponent } from './features/admin/admin-dashboard/admin-dashboard.component';
import { UserListComponent } from './features/admin/user-list/user-list.component';
import { authGuard } from './core/auth.guard';
import { roleGuard } from './core/role.guard';

/**
 * Application Routes Configuration
 * 
 * Implements role-based access control with guards:
 * - /login: Public login page
 * - /user: User dashboard (requires authentication)
 * - /admin: Admin dashboard and management (requires admin role)
 */
export const routes: Routes = [
  { 
    path: 'login', 
    component: LoginComponent 
  },
  { 
    path: 'user', 
    component: UserDashboardComponent, 
    canActivate: [authGuard] 
  },
  { 
    path: 'admin', 
    component: AdminDashboardComponent, 
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
    children: [
      { 
        path: 'users', 
        component: UserListComponent 
      },
      { 
        path: '', 
        redirectTo: 'users', 
        pathMatch: 'full' 
      }
    ]
  },
  { 
    path: '', 
    redirectTo: 'login', 
    pathMatch: 'full' 
  },
  { 
    path: '**', 
    redirectTo: 'login' 
  }
];
