import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlingService {

  constructor() { }

  /**
   * Handles HTTP errors and returns user-friendly error messages
   * 
   * @param error - The HTTP error response
   * @returns Observable that throws a formatted error
   */
  handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred. Please try again later.';

    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Network error: ${error.error.message}`;
      console.error('Client-side error:', error.error.message);
    } else {
      // Backend error
      errorMessage = this.getServerErrorMessage(error);
      console.error(`Backend error: Status ${error.status}, Message: ${error.message}`);
    }

    // Log error for debugging
    this.logError(error);

    return throwError(() => new Error(errorMessage));
  }

  /**
   * Handles application errors
   * 
   * @param error - The error object
   * @returns Formatted error message
   */
  handleApplicationError(error: Error): string {
    console.error('Application error:', error);
    this.logError(error);
    
    return error.message || 'An unexpected error occurred.';
  }

  /**
   * Gets user-friendly error message based on HTTP status code
   * 
   * @param error - The HTTP error response
   * @returns User-friendly error message
   */
  private getServerErrorMessage(error: HttpErrorResponse): string {
    switch (error.status) {
      case 400:
        return 'Bad request. Please check your input.';
      case 401:
        return 'Unauthorized. Please log in again.';
      case 403:
        return 'Access forbidden. You don\'t have permission to access this resource.';
      case 404:
        return 'Resource not found.';
      case 409:
        return 'Conflict. This operation cannot be completed.';
      case 422:
        return 'Validation error. Please check your input.';
      case 500:
        return 'Internal server error. Please try again later.';
      case 503:
        return 'Service unavailable. Please try again later.';
      default:
        return error.error?.message || error.message || 'An error occurred. Please try again.';
    }
  }

  /**
   * Logs error to console and can be extended to log to a remote service
   * 
   * @param error - The error to log
   */
  private logError(error: Error | HttpErrorResponse): void {
    // In a production app, you would send this to a logging service
    const timestamp = new Date().toISOString();
    
    if (error instanceof HttpErrorResponse) {
      console.error(`[${timestamp}] HTTP Error:`, {
        status: error.status,
        statusText: error.statusText,
        url: error.url,
        message: error.message
      });
    } else {
      console.error(`[${timestamp}] Application Error:`, {
        message: error.message,
        stack: error.stack
      });
    }
  }

  /**
   * Validates form errors and returns user-friendly messages
   * 
   * @param errors - Form validation errors
   * @returns Array of error messages
   */
  getFormValidationErrors(errors: { [key: string]: unknown }): string[] {
    const errorMessages: string[] = [];

    Object.keys(errors).forEach(key => {
      switch (key) {
        case 'required':
          errorMessages.push('This field is required.');
          break;
        case 'email':
          errorMessages.push('Please enter a valid email address.');
          break;
        case 'minlength':
          errorMessages.push(`Minimum length is ${(errors[key] as { requiredLength: number }).requiredLength} characters.`);
          break;
        case 'maxlength':
          errorMessages.push(`Maximum length is ${(errors[key] as { requiredLength: number }).requiredLength} characters.`);
          break;
        case 'pattern':
          errorMessages.push('Please enter a valid format.');
          break;
        default:
          errorMessages.push('Invalid value.');
      }
    });

    return errorMessages;
  }
}

