/**
 * chart.ts - Chart component for visualizing breed distribution data
 * Standalone Angular component that renders a pie chart using Chart.js.
 * Displays breed frequency data from the animal shelter with dynamic updates.
 * Automatically handles chart lifecycle (creation, updates, destruction).
 */

import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  AfterViewInit,
  SimpleChanges,
  ElementRef,
  ViewChild
} from '@angular/core';
import { Chart, ArcElement, Tooltip, Legend, PieController } from 'chart.js';
import { BreedCount } from '../../services/animal';
import { CommonModule } from '@angular/common';

// Register only the Chart.js modules we need for a pie chart
// This keeps the bundle size small
Chart.register(ArcElement, Tooltip, Legend, PieController);

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chart.html',
  styleUrl: './chart.scss'
})
export class ChartComponent implements AfterViewInit, OnChanges, OnDestroy {

  // ============================================
  // INPUT PROPERTIES
  // ============================================

  /**
   * Breed distribution data passed in from the dashboard
   * Array of BreedCount objects containing breed names and their frequencies
   */
  @Input() breedData: BreedCount[] = [];

  /**
   * The rescue type label for the chart title
   * Determines which rescue category is being displayed
   * Values: 'water', 'mountain', 'disaster', or 'reset'
   */
  @Input() rescueType: string = 'reset';

  // ============================================
  // VIEW CHILD
  // ============================================

  /**
   * Reference to the canvas element where the chart will be rendered
   * Accessed after view initialization for chart creation
   */
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  // ============================================
  // PRIVATE PROPERTIES
  // ============================================

  /**
   * Chart.js instance reference
   * Used for updating and destroying the chart
   */
  private chart: Chart | null = null;

  // ============================================
  // LIFECYCLE HOOKS
  // ============================================

  /**
   * Lifecycle hook called after the component's view has been initialized
   * Creates the initial chart when the view is ready
   */
  ngAfterViewInit(): void {
    this.buildChart();
  }

  /**
   * Lifecycle hook called when input properties change
   * Handles chart updates, destruction, or rebuilding based on data changes
   * 
   * @param {SimpleChanges} changes - Object containing changed input properties
   * 
   * Behavior:
   * - If breedData is empty: destroys existing chart
   * - If chart exists: updates with new data
   * - If chart doesn't exist: builds new chart
   */
  ngOnChanges(changes: SimpleChanges): void {
    // Check if breed data is empty - destroy chart if it exists
    if (this.breedData.length === 0) {
      if (this.chart) {
        this.chart.destroy();
        this.chart = null;
      }
      return;
    }

    // Update existing chart or build new one
    if (this.chart) {
      this.updateChart();    // Update existing chart with new data
    } else {
      // Use setTimeout to ensure view is ready for chart creation
      setTimeout(() => this.buildChart(), 0);
    }
  }

  /**
   * Lifecycle hook called when the component is destroyed
   * Cleans up chart instance to prevent memory leaks
   */
  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();    // Destroy chart and remove event listeners
    }
  }

  // ============================================
  // PUBLIC METHODS
  // ============================================

  /**
   * Generates a dynamic title for the chart based on the selected rescue type
   * Returns appropriate title text or default message when no type is selected
   * 
   * @returns {string} Display title for the chart
   */
  public getTitle(): string {
    // Default message when no rescue type is selected
    if (this.rescueType === 'reset' || !this.rescueType) {
      return 'Select a rescue type to see breed distribution';
    }

    // Map rescue type codes to display labels
    const labels: Record<string, string> = {
      water: 'Water Rescue',
      mountain: 'Mountain or Wilderness Rescue',
      disaster: 'Disaster or Individual Tracking'
    };

    return `Breed Distribution - ${labels[this.rescueType] || this.rescueType}`;
  }

  // ============================================
  // PRIVATE METHODS
  // ============================================

  /**
   * Generates a set of distinct colors for the pie chart slices
   * Uses a predefined palette and cycles through it for any number of breeds
   * 
   * @param {number} count - Number of colors needed (number of breeds)
   * @returns {string[]} Array of color hex codes
   */
  private generateColors(count: number): string[] {
    // Predefined color palette for consistent, visually distinct slices
    const palette = [
      '#4e79a7', '#f28e2b', '#e15759', '#76b7b2',
      '#59a14f', '#edc948', '#b07aa1', '#ff9da7',
      '#9c755f', '#bab0ac'
    ];

    // Generate colors, cycling through palette if more colors are needed
    const colors = [];
    for (let i = 0; i < count; i++) {
      colors.push(palette[i % palette.length]);
    }
    return colors;
  }

  /**
   * Builds the initial pie chart using the breed data
   * Creates a new Chart.js instance with pie chart configuration
   * Includes responsive design, legend, and custom tooltips with percentages
   */
  private buildChart(): void {
    // Ensure canvas element exists before building chart
    if (!this.chartCanvas) return;

    // Prepare data for chart
    const labels = this.breedData.map(b => b.breed);
    const data = this.breedData.map(b => b.count);
    const colors = this.generateColors(labels.length);

    // Create new Chart.js pie chart
    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'pie',    // Chart type: pie chart
      data: {
        labels,       // Breed names as labels
        datasets: [{
          data,                  // Breed counts as data values
          backgroundColor: colors, // Color for each slice
          borderWidth: 1          // Thin border between slices
        }]
      },
      options: {
        responsive: true,    // Chart adapts to container size
        plugins: {
          legend: {
            position: 'right',           // Legend positioned to the right
            labels: { font: { size: 11 } } // Smaller font for breed labels
          },
          tooltip: {
            callbacks: {
              /**
               * Custom tooltip label formatter
               * Displays breed name, count, and percentage of total
               */
              label: (ctx) => {
                // Calculate total for percentage
                const total = (ctx.dataset.data as number[]).reduce((a, b) => a + b, 0);
                const value = ctx.parsed;    // Current data value
                const pct = ((value / total) * 100).toFixed(1); // Percentage with 1 decimal
                return ` ${ctx.label}: ${value} (${pct}%)`;  // Format: "Breed: 5 (25.0%)"
              }
            }
          }
        }
      }
    });
  }

  /**
   * Updates the existing chart with new breed data and refreshes the display
   * Preserves chart instance but updates data, colors, and title
   * Calls chart.update() to re-render with new data
   */
  private updateChart(): void {
    // Ensure chart exists before updating
    if (!this.chart) return;

    // Prepare updated data
    const labels = this.breedData.map(b => b.breed);
    const data = this.breedData.map(b => b.count);
    const colors = this.generateColors(labels.length);

    // Update chart data and colors
    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = data;
    this.chart.data.datasets[0].backgroundColor = colors;

    // Update chart title based on current rescue type
    this.chart.options.plugins!.title = {
      display: true,
      text: this.getTitle()
    };

    // Re-render chart with updated data
    this.chart.update();
  }
}
