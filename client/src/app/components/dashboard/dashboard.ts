/**
 * dashboard.ts - Dashboard component for animal data visualization
 * Main container component that orchestrates the animal data dashboard.
 * Handles data fetching, state management, and coordinates child components
 * (table, map, chart).
 * Mirrors the Python dashboard's functionality with Angular patterns.
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { AnimalService, Animal, BreedCount } from '../../services/animal';
import { ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MapComponent } from '../map/map';
import { ChartComponent } from '../chart/chart';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MapComponent, ChartComponent],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {

  // ============================================
  // AUTHENTICATION PROPERTIES
  // ============================================

  /**
   * User role from authentication service
   * Used to determine admin privileges and UI visibility
   */
  role: string | null = null;

  /**
   * Login panel visibility state
   * Controls the login form modal/panel display
   */
  showLogin = false;

  /**
   * Username input for login form
   * Bound to login form input field
   */
  loginUsername = '';

  /**
   * Password input for login form
   * Bound to login form password field
   */
  loginPassword = '';

  /**
   * Error message displayed on failed login attempts
   */
  loginError = '';

  // ============================================
  // DATA PROPERTIES
  // ============================================

  /**
   * Array of animal records fetched from the API
   * Displayed in the data table
   */
  animals: Animal[] = [];

  /**
   * Total number of records available (for pagination)
   */
  total: number = 0;

  // ============================================
  // SEARCH PROPERTIES
  // ============================================

  /**
   * Controls visibility of search filters panel
   */
  showSearch: boolean = false;

  /**
   * Search filter criteria for filtering animal records
   * Supports filtering by ID, name, breed, and animal type
   */
  searchFilters = {
    animal_id: '',
    name: '',
    breed: '',
    animal_type: ''
  };

  // ============================================
  // MAP AND CHART PROPERTIES
  // ============================================

  /**
   * Currently selected animal for map display
   * Highlights animal location on the map when selected
   */
  selectedAnimal: Animal | null = null;

  /**
   * Breed distribution data for chart visualization
   * Contains breed names and counts for current rescue type
   */
  breedData: BreedCount[] = [];

  // ============================================
  // STATE MANAGEMENT
  // ============================================

  /**
   * Current pagination page index (0-based)
   */
  currentPage: number = 0;

  /**
   * Number of records to display per page
   */
  pageSize: number = 10;

  /**
   * Current rescue type filter
   * Values: 'water', 'mountain', 'disaster', 'reset'
   */
  rescueType: string = 'reset';

  /**
   * Loading state indicator
   * Shows loading spinner/overlay during data fetches
   */
  loading: boolean = false;

  /**
   * Error message for failed operations
   */
  error: string | null = null;

  /**
   * Success message for completed operations
   * Displayed after successful create/update/delete
   */
  successMessage: string | null = null;

  /**
   * Expose Math object to template for pagination calculations
   */
  Math = Math;

  // ============================================
  // COLUMN CONFIGURATION
  // ============================================

  /**
   * All available columns with their display labels
   * Used for column visibility toggling
   */
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

  /**
   * Set of hidden column keys
   * Mirrors HIDDEN_COLS_DEFAULT from Python dashboard
   * Initially hides less frequently used columns
   */
  hiddenColumns = new Set<string>([
    'date_of_birth',
    'datetime',
    'location_lat',
    'location_long',
    'age_upon_outcome_in_weeks'
  ]);

  // ============================================
  // COMPUTED PROPERTIES
  // ============================================

  /**
   * Getter that returns only visible columns in order
   * Filters out columns that are in hiddenColumns set
   */
  get visibleColumns() {
    return this.allColumns.filter(c => !this.hiddenColumns.has(c.key));
  }

  /**
   * Toggles a column's visibility
   * Adds to or removes from hiddenColumns set
   * @param {string} key - Column key to toggle
   */
  toggleColumn(key: string): void {
    if (this.hiddenColumns.has(key)) {
      this.hiddenColumns.delete(key);    // Show column
    } else {
      this.hiddenColumns.add(key);       // Hide column
    }
  }

  /**
   * Checks if a column is currently visible
   * @param {string} key - Column key to check
   * @returns {boolean} True if column is visible
   */
  isVisible(key: string): boolean {
    return !this.hiddenColumns.has(key);
  }

  /**
   * Total number of pages for pagination
   * Calculated based on total records and page size
   */
  get totalPages(): number {
    return Math.ceil(this.total / this.pageSize);
  }

  // ============================================
  // RESCUE TYPE CONFIGURATION
  // ============================================

  /**
   * The four filter buttons - mirrors btn1/btn2/btn3/btn4 from Python dashboard
   * Each has a unique ID and display label with emoji
   */
  rescueTypes = [
    { id: 'water', label: '💧 Water' },
    { id: 'mountain', label: '🏔️ Mountain or Wilderness' },
    { id: 'disaster', label: '🌪️ Disaster or Individual Tracking' },
    { id: 'reset', label: '🔄 Reset Filters' }
  ];

  // ============================================
  // CONSTRUCTOR
  // ============================================

  constructor(
    private animalService: AnimalService,    // Service for animal API operations
    public authService: AuthService,         // Authentication service (public for template access)
    private cdr: ChangeDetectorRef,          // Manual change detection
    private router: Router,                  // Navigation
    private http: HttpClient                 // HTTP client for login requests
  ) { }

  // ============================================
  // LIFECYCLE HOOKS
  // ============================================

  /**
   * Runs automatically when the component loads
   * Mirrors the initial shelter.read({}) call in the Python dashboard
   * Loads initial animal data and retrieves user role
   */
  ngOnInit(): void {
    this.loadAnimals();      // Load initial data
    this.role = this.authService.getRole();    // Get user role for admin features
  }

  // ============================================
  // RESCUE TYPE FILTERING
  // ============================================

  /**
   * Called when a filter button is clicked
   * Updates rescue type, resets pagination, and reloads data
   * @param {string} type - Rescue type identifier
   */
  selectRescueType(type: string): void {
    this.rescueType = type;
    this.currentPage = 0;    // Reset to first page on filter change
    this.loadAnimals();      // Reload data with new filter
    this.loadBreedData();    // Reload chart data
  }

  // ============================================
  // DATA FETCHING
  // ============================================

  /**
   * Fetches animals from the API based on current state
   * Includes rescue type, pagination, and search filters
   * Updates animals array and total count
   */
  loadAnimals(): void {
    this.loading = true;
    this.error = null;

    // Fetch animals from service
    this.animalService.getAnimals(
      this.rescueType,
      this.currentPage,
      this.pageSize
    )
      .subscribe({
        next: (res: any) => {
          // Update state with response data
          this.animals = [...(res.animals || [])];
          this.total = res.total ?? 0;

          this.loading = false;

          // Force UI update after data change
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = 'Failed to load data';
          this.loading = false;
        }
      });
  }

  /**
   * Called by pagination buttons
   * Navigates to specified page and reloads data
   * @param {number} page - Page index to navigate to
   */
  changePage(page: number): void {
    this.currentPage = page;
    this.loadAnimals();
  }

  // ============================================
  // MAP INTERACTION
  // ============================================

  /**
   * Maps the selected animal to the map component
   * Highlights the animal's location on the map
   * @param {Animal} animal - Animal to select for map display
   */
  selectAnimal(animal: Animal): void {
    this.selectedAnimal = animal;
    this.cdr.detectChanges();
  }

  // ============================================
  // CHART DATA
  // ============================================

  /**
   * Called by the chart component to load breed distribution data
   * Fetches breed counts for the current rescue type
   * Resets data if 'reset' type is selected
   */
  loadBreedData(): void {
    // Clear data if reset filter is active
    if (this.rescueType === 'reset') {
      this.breedData = [];
      return;
    }

    // Fetch breed distribution for selected rescue type
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

  // ============================================
  // SEARCH FUNCTIONALITY
  // ============================================

  /**
   * Toggles the search panel visibility
   */
  toggleSearch(): void {
    this.showSearch = !this.showSearch;
  }

  /**
   * Performs search with current filter criteria
   * Resets pagination to first page and fetches filtered results
   */
  searchAnimals(): void {
    this.loading = true;
    this.error = null;
    this.currentPage = 0;    // Reset to first page

    // Fetch animals with search filters
    this.animalService
      .searchAnimals(this.searchFilters)
      .subscribe({
        next: (res) => {
          this.animals = [...(res.animals || [])];
          this.total = res.total ?? 0;

          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error("Search failed", err);

          this.animals = [];
          this.total = 0;
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  /**
   * Clears all search filters and reloads all data
   * Resets search form and fetches unfiltered data
   */
  clearSearch(): void {
    // Reset search filters
    this.searchFilters = {
      animal_id: '',
      name: '',
      breed: '',
      animal_type: ''
    };

    // Reload animals without filters
    this.loadAnimals();
  }

  // ============================================
  // CRUD OPERATIONS
  // ============================================

  /**
   * Navigates to the animal creation form
   */
  addAnimal(): void {
    this.router.navigate(['/animals/new']);
  }

  /**
   * Navigates to the animal edit form
   * @param {Animal} animal - Animal record to edit
   */
  editAnimal(animal: Animal): void {
    this.router.navigate(['/animals/edit', animal._id]);
  }

  /**
   * Deletes an animal record after confirmation
   * Shows confirmation dialog before deletion
   * Refreshes table after successful deletion
   * @param {string} id - Animal ID to delete
   */
  deleteAnimal(id: string): void {
    // Confirm deletion with user
    if (!confirm('Delete this animal record?')) {
      return;
    }

    this.successMessage = null;
    this.error = null;

    // Call delete API
    this.animalService.deleteAnimal(id)
      .subscribe({
        next: () => {
          // Show success message
          this.successMessage = 'Animal record deleted successfully.';

          // Auto-clear success message after 3 seconds
          setTimeout(() => {
            this.successMessage = null;
          }, 3000);

          // Refresh table after deletion
          this.loadAnimals();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Delete failed:', err);
          this.error = 'Failed to delete animal';
          this.cdr.detectChanges();
        }
      });
  }

  // ============================================
  // ADMIN AND AUTHENTICATION
  // ============================================

  /**
   * Navigates to the admin panel
   * Available only to admin users
   */
  openAdmin(): void {
    this.router.navigate(['/admin']);
  }

  /**
   * Toggles the login panel visibility
   * Hides search panel when login is opened
   */
  login(): void {
    this.showLogin = !this.showLogin;
    this.showSearch = false;    // Hide search when login opens
    this.loginError = '';
  }

  /**
   * Logs out the current user
   * Clears authentication state
   */
  logout(): void {
    this.authService.logout();
    this.role = null;
  }

  /**
   * Performs authentication with the API
   * Stores token and role in localStorage on success
   * Displays error message on failure
   */
  performLogin(): void {
    this.loginError = '';

    // Send login request to API
    this.http.post<any>('http://localhost:3000/api/auth/login', {
      username: this.loginUsername,
      password: this.loginPassword
    })
      .subscribe({
        next: (response) => {
          // Store authentication data
          localStorage.setItem('token', response.token);
          localStorage.setItem('role', response.role);

          this.role = response.role;
          this.showLogin = false;    // Close login panel

          // Clear form fields
          this.loginUsername = '';
          this.loginPassword = '';

          this.cdr.detectChanges();
        },
        error: () => {
          this.loginError = 'Invalid username or password';
        }
      });
  }
}
