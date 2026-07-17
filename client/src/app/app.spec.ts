/**
 * app.spec.ts
 * Unit tests for AppComponent
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../app/services/auth';
import { App } from '../app/app';

// Create a test component that extends App to avoid template issues
@Component({
  selector: 'app-test',
  standalone: true,
  template: '<div>Test App</div>',
})
class TestApp extends App {
  // App constructor takes no arguments - it uses inject() internally
  constructor() {
    super();
  }
}

describe('App', () => {
  let authService: any;
  let router: any;

  beforeEach(async () => {
    authService = {
      isLoggedIn: vi.fn().mockReturnValue(false),
      getRole: vi.fn().mockReturnValue(null),
      logout: vi.fn()
    };

    router = {
      navigate: vi.fn(),
      url: '/',
      events: {
        subscribe: vi.fn().mockReturnValue({ unsubscribe: vi.fn() })
      },
      createUrlTree: vi.fn(),
      serializeUrl: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [TestApp],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(TestApp);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
