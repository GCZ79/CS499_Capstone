/**
 * header.ts - Header component for the Grazioso Salvare application
 * Displays the main navigation header with logo and navigation links
 * Provides consistent navigation across all pages using RouterModule
 */

import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule],    // Enables router links in the template
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  // Currently a static navigation component with router links
}
