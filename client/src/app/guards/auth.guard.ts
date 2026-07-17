/**
 * auth.guard.ts - Route guard for authentication
 * Protects routes from unauthorized access by checking if user is logged in
 * Redirects to dashboard if authentication fails
 */

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

/**
 * Authentication guard function
 * Checks if the user is logged in before allowing route activation
 * 
 * @returns {boolean} True if user is authenticated, false otherwise
 * 
 * Behavior:
 * - If user is logged in: allows route access (returns true)
 * - If user is not logged in: redirects to dashboard and denies access (returns false)
 */
export const authGuard: CanActivateFn = () => {
  // Inject required services using Angular's inject() function
  const auth = inject(AuthService);   // Service to check authentication status
  const router = inject(Router);      // Router for navigation

  // Check if user is authenticated
  if (auth.isLoggedIn()) {
    return true;      // Allow route access
  }

  // User is not authenticated - redirect to dashboard
  router.navigate(['/dashboard']);

  return false;       // Deny route access
};
