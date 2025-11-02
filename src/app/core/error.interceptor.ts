import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ErrorHandlingService } from './error-handling.service';

/**
 * HTTP Error Interceptor
 * 
 * Intercepts all HTTP errors globally and handles them appropriately.
 * Automatically logs out users on 401 errors.
 * Logs all errors for debugging and monitoring.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const errorHandler = inject(ErrorHandlingService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized - automatically redirect to login
      if (error.status === 401) {
        // Clear any stored authentication data
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_expires');
        
        // Redirect to login
        router.navigate(['/login']);
      }

      // Use error handling service to process the error
      return errorHandler.handleError(error);
    })
  );
};
