/**
 * auth.interceptor.ts - HTTP interceptor for JWT authentication
 * Adds JWT authentication token to outgoing HTTP requests.
 * This prevents the need to manually add Authorization headers in every service.
 * Intercepts all HTTP requests and automatically attaches the token when available.
 */

import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler
} from '@angular/common/http';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  /**
   * Intercepts HTTP requests and adds JWT token to headers
   * 
   * @param {HttpRequest<any>} request - The outgoing HTTP request
   * @param {HttpHandler} next - The next interceptor or HTTP handler in the chain
   * @returns {Observable<HttpEvent<any>>} The HTTP event stream with authenticated request
   * 
   * Behavior:
   * - If token exists in localStorage: clones request and adds Authorization header
   * - If no token: passes request through unchanged
   */
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ) {
    // Retrieve JWT token from localStorage
    const token = localStorage.getItem('token');

    // No logged-in user - send request normally without authentication
    if (!token) {
      return next.handle(request);
    }

    // Clone the request and add Authorization header with Bearer token
    const authenticatedRequest = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    // Send the authenticated request
    return next.handle(authenticatedRequest);
  }
}
