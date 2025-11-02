import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const currentUser = authService.getCurrentUser();
  
  // If no user is authenticated, redirect to login
  if (!currentUser) {
    router.navigate(['/login']);
    return false;
  }

  // Get required roles from route data (if specified)
  const requiredRoles = route.data['roles'] as string[] | undefined;
  
  // If no specific roles are required, just check for authentication
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  // Check if user has one of the required roles
  if (requiredRoles.includes(currentUser.role)) {
    return true;
  }

  // User doesn't have required role
  // Redirect to appropriate dashboard based on their actual role
  if (currentUser.role === 'admin') {
    router.navigate(['/admin']);
  } else {
    router.navigate(['/user']);
  }
  
  return false;
};
