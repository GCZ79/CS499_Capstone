/**
 * app.ts - Root component for the Grazioso Salvare application
 * Serves as the main container component that wraps the entire application
 * Includes the header, footer, and router outlet for page navigation
 * Uses Angular signals for reactive state management
 */

import { Component, signal } from '@angular/core';
import { Header } from './shared/header/header';
import { Footer } from './shared/footer/footer';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [Header, Footer, RouterOutlet],    // Import shared components and router outlet
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  /**
   * Application title using Angular signal
   * Provides reactive state management for the app title
   * Currently set to 'client' but can be updated dynamically
   */
  protected readonly title = signal('client');
}
