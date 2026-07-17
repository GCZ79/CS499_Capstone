/**
 * app.config.ts - Application configuration for the Angular app
 * Configures global providers including routing, HTTP client, and error handling.
 * Provides dependency injection configuration for the entire application.
 */

import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { routes } from './app.routes';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';

// ============================================
// APPLICATION CONFIGURATION
// ============================================

export const appConfig: ApplicationConfig = {
  providers: [
    // Global error handling
    provideBrowserGlobalErrorListeners(),

    // Router configuration with scroll restoration and anchor scrolling
    provideRouter(
      routes,
      withInMemoryScrolling({
        anchorScrolling: 'enabled',          // Enables anchor/fragment scrolling
        scrollPositionRestoration: 'enabled' // Restores scroll position on navigation
      })
    ),

    // HTTP client with dependency injection support for interceptors
    provideHttpClient(withInterceptorsFromDi()),

    // HTTP interceptor registration for JWT authentication
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,  // Registers AuthInterceptor for all HTTP requests
      multi: true                 // Allows multiple interceptors to be registered
    }
  ]
};
