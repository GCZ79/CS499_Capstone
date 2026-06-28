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

// Register only the Chart.js modules we need
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

  // Breed distribution data passed in from the dashboard
  @Input() breedData: BreedCount[] = [];

  // The rescue type label for the chart title
  @Input() rescueType: string = 'reset';

  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  private chart: Chart | null = null;

  ngAfterViewInit(): void {
    this.buildChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.breedData.length === 0) {
      if (this.chart) {
        this.chart.destroy();
        this.chart = null;
      }
      return;
    }

    if (this.chart) {
      this.updateChart();
    } else {
     setTimeout(() => this.buildChart(), 0);
    }
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  public getTitle(): string {
    if (this.rescueType === 'reset' || !this.rescueType) {
      return 'Select a rescue type to see breed distribution';
    }
    const labels: Record<string, string> = {
      water: 'Water Rescue',
      mountain: 'Mountain or Wilderness Rescue',
      disaster: 'Disaster or Individual Tracking'
    };
    return `Breed Distribution — ${labels[this.rescueType] || this.rescueType}`;
  }

  private generateColors(count: number): string[] {
    // Generate distinct colors for each breed slice
    const palette = [
      '#4e79a7', '#f28e2b', '#e15759', '#76b7b2',
      '#59a14f', '#edc948', '#b07aa1', '#ff9da7',
      '#9c755f', '#bab0ac'
    ];
    const colors = [];
    for (let i = 0; i < count; i++) {
      colors.push(palette[i % palette.length]);
    }
    return colors;
  }

  private buildChart(): void {
    if (!this.chartCanvas) return;

    const labels = this.breedData.map(b => b.breed);
    const data = this.breedData.map(b => b.count);
    const colors = this.generateColors(labels.length);

    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'right',
            labels: { font: { size: 11 } }
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const total = (ctx.dataset.data as number[]).reduce((a, b) => a + b, 0);
                const value = ctx.parsed;
                const pct = ((value / total) * 100).toFixed(1);
                return ` ${ctx.label}: ${value} (${pct}%)`;
              }
            }
          }
        }
      }
    });
  }

  private updateChart(): void {
    if (!this.chart) return;

    const labels = this.breedData.map(b => b.breed);
    const data = this.breedData.map(b => b.count);
    const colors = this.generateColors(labels.length);

    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = data;
    this.chart.data.datasets[0].backgroundColor = colors;
    this.chart.options.plugins!.title = {
      display: true,
      text: this.getTitle()
    };

    this.chart.update();
  }
}
