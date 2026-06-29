/**
 * dashboard.ts - Dashboard component for animal data visualization
 * Main container component that orchestrates the animal data dashboard.
 * Handles data fetching, state management, and coordinates child components
 * (table, map, chart).
 * Mirrors the Python dashboard's functionality with Angular patterns.
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnimalService, Animal, AnimalResponse, BreedCount } from '../../services/animal';
import { ChangeDetectorRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MapComponent } from '../map/map';
import { ChartComponent } from '../chart/chart';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MapComponent, ChartComponent],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {

  // Data from the API
  animals: Animal[] = [];
  total: number = 0;

  // Map and chart data
  selectedAnimal: Animal | null = null;
  breedData: BreedCount[] = [];

  // Current state
  currentPage: number = 0;
  pageSize: number = 10;
  rescueType: string = 'reset';
  loading: boolean = false;
  error: string | null = null;

  // Used in the template for Math.ceil()
  Math = Math;

  // All available columns with display labels
  allColumns = [
    { key: 'animal_id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'breed', label: 'Breed' },
    { key: 'animal_type', label: 'Type' },
    { key: 'color', label: 'Color' },
    { key: 'sex_upon_outcome', label: 'Sex' },
    { key: 'age_upon_outcome', label: 'Age' },
    { key: 'outcome_type', label: 'Outcome' },
    { key: 'outcome_subtype', label: 'Outcome Subtype' },
    { key: 'date_of_birth', label: 'Date of Birth' },
    { key: 'datetime', label: 'Outcome Date' },
    { key: 'age_upon_outcome_in_weeks', label: 'Weeks' },
    { key: 'location_lat', label: 'Lat' },
    { key: 'location_long', label: 'Long' }
  ];

  // Columns hidden by default - mirrors HIDDEN_COLS_DEFAULT from Python dashboard
  hiddenColumns = new Set<string>([
    'date_of_birth',
    'datetime',
    'location_lat',
    'location_long',
    'age_upon_outcome_in_weeks'
  ]);

  // Computed: only the visible columns in order
  get visibleColumns() {
    return this.allColumns.filter(c => !this.hiddenColumns.has(c.key));
  }

  // Toggle a column on or off
  toggleColumn(key: string): void {
    if (this.hiddenColumns.has(key)) {
      this.hiddenColumns.delete(key);
    } else {
      this.hiddenColumns.add(key);
    }
  }

  // Check if a column is currently visible
  isVisible(key: string): boolean {
    return !this.hiddenColumns.has(key);
  }

  // The four filter buttons - mirrors btn1/btn2/btn3/btn4
  rescueTypes = [
    { id: 'water', label: '💧 Water' },
    { id: 'mountain', label: '🏔️ Mountain or Wilderness' },
    { id: 'disaster', label: '🌪️ Disaster or Individual Tracking' },
    { id: 'reset', label: '🔄 Reset Filters' }
  ];

  constructor(
    private animalService: AnimalService,
    private cdr: ChangeDetectorRef
  ) { }

  // Runs automatically when the component loads
  // Mirrors the initial shelter.read({}) call in the Python dashboard
  ngOnInit(): void {
    this.loadAnimals();
  }

  // Called when a filter button is clicked
  selectRescueType(type: string): void {
    this.rescueType = type;
    this.currentPage = 0;   // reset to first page on filter change
    this.loadAnimals();
    this.loadBreedData();
  }

  // Fetches animals from the API based on current state
  loadAnimals(): void {
    console.log("LOAD START");

    this.loading = true;
    this.error = null;

    this.animalService.getAnimals(
      this.rescueType,
      this.currentPage,
      this.pageSize
    )
      .subscribe({
        next: (res: any) => {
          console.log("NEXT FIRED", res);

          this.animals = [...(res.animals || [])];
          this.total = res.total ?? 0;

          this.loading = false;

          this.cdr.detectChanges(); // force UI update after data change

          console.log("STATE UPDATED");
        },

        error: (err) => {
          console.log("ERROR", err);

          this.error = 'Failed to load data';
          this.loading = false;
        }
      });
  }

  // Called by pagination buttons
  changePage(page: number): void {
    this.currentPage = page;
    this.loadAnimals();
  }

  // Total number of pages
  get totalPages(): number {
    return Math.ceil(this.total / this.pageSize);
  }

  // Maps the selected animal to the map component
  selectAnimal(animal: Animal): void {
    this.selectedAnimal = animal;
    this.cdr.detectChanges();
  }

  // Called by the chart component to load breed distribution data
  loadBreedData(): void {
    if (this.rescueType === 'reset') {
      this.breedData = [];
      return;
    }
    this.animalService.getBreedDistribution(this.rescueType)
      .subscribe({
        next: (data) => {
          this.breedData = data;
          this.cdr.detectChanges();
        },
        error: () => {
          this.breedData = [];
        }
      });
  }
}
