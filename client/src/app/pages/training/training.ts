/**
 * training.ts - Training component for the Grazioso Salvare website
 * Displays detailed information about the three training programs:
 * Water Rescue, Disaster Response, and Mountain Rescue
 * Supports fragment scrolling for deep-linking to specific program sections
 */

import { Component, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-training',
  standalone: true,
  imports: [],
  templateUrl: './training.html',
  styleUrl: './training.scss'
})
export class Training implements AfterViewInit {

  constructor(private route: ActivatedRoute) { }

  /**
   * Lifecycle hook called after the component's view has been initialized
   * Handles fragment-based scrolling to specific training sections
   * Subscribes to route fragment changes and scrolls to the target element
   */
  ngAfterViewInit(): void {
    // Subscribe to route fragment for deep-linking
    this.route.fragment.subscribe(fragment => {
      // If fragment exists, scroll to the corresponding element
      if (fragment) {
        // Small delay to ensure DOM is fully rendered
        setTimeout(() => {
          const el = document.getElementById(fragment);
          if (el) {
            // Smooth scroll to the target element
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    });
  }
}
