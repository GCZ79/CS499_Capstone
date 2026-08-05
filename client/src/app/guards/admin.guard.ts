/**
 * admin.guard.ts - Route guard for admin-only access
 * Protects administrative routes by checking if user has admin privileges
 * Redirects to dashboard if user is not an administrator
 */

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

/**
 * Admin guard function
 * Checks if the user has administrative privileges before allowing route activation
 * 
 * @returns {boolean} True if user is an admin, false otherwise
 * 
 * Behavior:
 * - If user is admin: allows route access (returns true)
 * - If user is not admin: redirects to dashboard and denies access (returns false)
 * 
 * Use this guard to protect admin-only routes like:
 * - Admin dashboard
 * - User management
 * - System configuration
 * - Backup and restore operations
 */
export const adminGuard: CanActivateFn = () => {
  // Inject required services using Angular's inject() function
  const auth = inject(AuthService);   // Service to check user role/permissions
  const router = inject(Router);      // Router for navigation

  // Check if user has admin privileges
  if (auth.isAdmin()) {
    return true;      // Allow route access - user is an admin
  }

  // User is not an admin - redirect to dashboard
  router.navigate(['/dashboard']);

  return false;       // Deny route access - insufficient permissions
};
