/**
 * home.ts - Home component for the Grazioso Salvare application
 * Serves as the landing page with navigation to main features
 * Provides a welcoming introduction to the animal rescue platform
 */

import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [RouterModule],    // Enables router links in the template
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  // Currently a static landing page with navigation links
}
