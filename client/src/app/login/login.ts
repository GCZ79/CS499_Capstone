/**
 * login.ts - Login component for user authentication
 * Handles user authentication by sending credentials to Express API.
 * Stores JWT token and role in localStorage upon successful login.
 * Redirects to dashboard after authentication.
 */

import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../services/auth';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})

export class Login {

  // ============================================
  // PROPERTIES
  // ============================================

  /**
   * Username input from login form
   * Bound to username field using ngModel
   */
  username = '';

  /**
   * Password input from login form
   * Bound to password field using ngModel
   */
  password = '';

  /**
   * Error message displayed on failed login attempts
   * Shown to user when authentication fails
   */
  error = '';

  // ============================================
  // CONSTRUCTOR
  // ============================================

  constructor(
    private http: HttpClient,        // HTTP client for API requests
    private auth: AuthService,       // Authentication service (for future use)
    private router: Router           // Router for navigation
  ) { }

  // ============================================
  // PUBLIC METHODS
  // ============================================

  /**
   * Performs user authentication with the API
   * Sends username and password to the login endpoint
   * Stores JWT token and role in localStorage on success
   * Navigates to dashboard after successful login
   * Displays error message on failed login
   */
  login(): void {
    // Send login request to authentication API
    this.http.post<any>(
      'http://localhost:3000/api/auth/login',
      {
        username: this.username,
        password: this.password
      }
    )
      .subscribe({
        /**
         * Success handler
         * Stores authentication data and navigates to dashboard
         */
        next: (response) => {
          /*
            Store JWT information.
            The interceptor will use the token automatically
            for future API calls.
          */

          // Store JWT token for authenticated requests
          localStorage.setItem('token', response.token);

          // Store user role for authorization checks
          localStorage.setItem('role', response.role);

          // Return to dashboard after successful login
          this.router.navigate(['/dashboard']);
        },

        /**
         * Error handler
         * Displays user-friendly error message
         */
        error: (err) => {
          console.error(err);    // Log error to console for debugging

          // Display user-friendly error message
          this.error = 'Invalid username or password';
        }
      });
  }
}
