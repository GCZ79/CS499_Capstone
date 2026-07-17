/**
 * auth.ts
 *
 * Handles authentication state.
 *
 * Stores:
 * - JWT token
 * - User role
 *
 * Used by components and guards
 * to determine user permissions.
 */

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  // Returns JWT token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Returns current user role
  getRole(): string | null {
    return localStorage.getItem('role');
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  // Check for specific role
  hasRole(role: string): boolean {
    return this.getRole() === role;
  }

  // Employee or admin permissions
  canEdit(): boolean {
    const role = this.getRole();

    return (
      role === 'employee' ||
      role === 'admin'
    );
  }

  // Admin permissions
  isAdmin(): boolean {
    return this.getRole() === 'admin';
  }

  // Logout user
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  }
}
