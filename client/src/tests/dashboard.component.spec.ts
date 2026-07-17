/**
 * dashboard.component.spec.ts
 * Unit tests for DashboardComponent (Angular 21 + Vitest style)
 * AnimalService is mocked to avoid HTTP calls.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { DashboardComponent } from '../app/components/dashboard/dashboard';
import { AnimalService, Animal, AnimalResponse, BreedCount } from '../app/services/animal';
import { AuthService } from '../app/services/auth';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef } from '@angular/core';

// Create a simplified test component that extends DashboardComponent
// This avoids the template compilation issues
@Component({
  selector: 'app-dashboard-test',
  standalone: true,
  template: '<div>Test Dashboard</div>',
})
class TestDashboardComponent extends DashboardComponent {
  constructor(
    animalService: AnimalService,
    authService: AuthService,
    cdr: ChangeDetectorRef,
    router: Router,
    http: HttpClient
  ) {
    super(animalService, authService, cdr, router, http);
  }
}

describe('DashboardComponent', () => {
  let component: TestDashboardComponent;
  let fixture: ComponentFixture<TestDashboardComponent>;
  let animalService: any;
  let authService: any;
  let router: any;
  let httpClient: any;
  let cdr: any;

  const mockAnimals: Animal[] = [
    {
      _id: '1',
      animal_id: 'A123456',
      name: 'Buddy',
      breed: 'Labrador',
      animal_type: 'Dog',
      color: 'Yellow',
      sex_upon_outcome: 'Intact Male',
      age_upon_outcome: '2 years',
      age_upon_outcome_in_weeks: 104,
      outcome_type: 'Adoption',
      outcome_subtype: 'Foster',
      date_of_birth: '2020-01-15',
      datetime: '2022-01-15T10:00:00Z',
      location_lat: 30.75,
      location_long: -97.48
    },
    {
      _id: '2',
      animal_id: 'B789012',
      name: 'Max',
      breed: 'German Shepherd',
      animal_type: 'Dog',
      color: 'Black/Tan',
      sex_upon_outcome: 'Intact Male',
      age_upon_outcome: '3 years',
      age_upon_outcome_in_weeks: 156,
      outcome_type: 'Transfer',
      outcome_subtype: 'Partner',
      date_of_birth: '2019-05-20',
      datetime: '2022-05-20T14:30:00Z',
      location_lat: 30.76,
      location_long: -97.49
    }
  ];

  const mockResponse: AnimalResponse = {
    animals: mockAnimals,
    total: 2,
    page: 0,
    pageSize: 10
  };

  const mockBreedData: BreedCount[] = [
    { breed: 'Labrador', count: 10 },
    { breed: 'German Shepherd', count: 8 }
  ];

  beforeEach(async () => {
    // Create mock services
    animalService = {
      getAnimals: vi.fn().mockReturnValue(of(mockResponse)),
      getBreedDistribution: vi.fn().mockReturnValue(of(mockBreedData)),
      deleteAnimal: vi.fn().mockReturnValue(of({}))
    };

    authService = {
      getRole: vi.fn().mockReturnValue('admin'),
      logout: vi.fn()
    };

    router = {
      navigate: vi.fn()
    };

    httpClient = {
      post: vi.fn()
    };

    cdr = {
      detectChanges: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [TestDashboardComponent],
      providers: [
        { provide: AnimalService, useValue: animalService },
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
        { provide: HttpClient, useValue: httpClient },
        { provide: ChangeDetectorRef, useValue: cdr }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(TestDashboardComponent);
    component = fixture.componentInstance;
    
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  //
  // INITIALIZATION
  //

  describe('Initialization', () => {

    it('creates component', () => {
      expect(component).toBeTruthy();
    });

    it('loads animals on init', () => {
      // Setup mocks for this test
      animalService.getAnimals.mockReturnValue(of(mockResponse));
      authService.getRole.mockReturnValue('admin');

      component.ngOnInit();

      expect(animalService.getAnimals).toHaveBeenCalledWith('reset', 0, 10);
      expect(component.animals).toEqual(mockAnimals);
      expect(component.total).toBe(2);
      expect(component.loading).toBe(false);
      expect(component.role).toBe('admin');
    });

    it('sets error on failure', () => {
      animalService.getAnimals.mockReturnValue(throwError(() => new Error('fail')));

      component.loadAnimals();

      expect(component.error).toBe('Failed to load data');
      expect(component.loading).toBe(false);
    });

  });

  //
  // FILTERING
  //

  describe('Filtering', () => {

    it('updates rescue type and resets page', () => {
      animalService.getAnimals.mockReturnValue(of(mockResponse));
      animalService.getBreedDistribution.mockReturnValue(of(mockBreedData));

      component.currentPage = 3;
      component.selectRescueType('water');

      expect(component.rescueType).toBe('water');
      expect(component.currentPage).toBe(0);
      expect(animalService.getAnimals).toHaveBeenCalledWith('water', 0, 10);
    });

    it('calls API with correct filter', () => {
      animalService.getAnimals.mockClear();
      animalService.getAnimals.mockReturnValue(of(mockResponse));
      animalService.getBreedDistribution.mockReturnValue(of(mockBreedData));

      component.selectRescueType('mountain');

      expect(animalService.getAnimals).toHaveBeenCalledWith('mountain', 0, 10);
    });

    it('loads breed data when not reset', () => {
      animalService.getAnimals.mockClear();
      animalService.getAnimals.mockReturnValue(of(mockResponse));
      animalService.getBreedDistribution.mockReturnValue(of(mockBreedData));

      component.selectRescueType('water');

      expect(animalService.getBreedDistribution).toHaveBeenCalledWith('water');
      expect(component.breedData).toEqual(mockBreedData);
    });

    it('clears breed data on reset', () => {
      animalService.getAnimals.mockClear();
      
      // Set initial breed data
      component.breedData = mockBreedData;
      
      animalService.getAnimals.mockReturnValue(of(mockResponse));

      component.selectRescueType('reset');

      expect(component.breedData).toEqual([]);
    });

  });

  //
  // PAGINATION
  //

  describe('Pagination', () => {

    it('changes page correctly', () => {
      animalService.getAnimals.mockClear();
      animalService.getAnimals.mockReturnValue(of(mockResponse));

      component.changePage(2);

      expect(component.currentPage).toBe(2);
      expect(animalService.getAnimals).toHaveBeenCalledWith('reset', 2, 10);
    });

    it('calculates total pages', () => {
      component.total = 25;
      component.pageSize = 10;

      expect(component.totalPages).toBe(3);
    });

  });

  //
  // COLUMN VISIBILITY
  //

  describe('Column Visibility', () => {

    it('toggles columns', () => {
      expect(component.isVisible('name')).toBe(true);

      component.toggleColumn('name');
      expect(component.isVisible('name')).toBe(false);

      component.toggleColumn('name');
      expect(component.isVisible('name')).toBe(true);
    });

  });

  //
  // SELECTION
  //

  describe('Selection', () => {

    it('selects animal', () => {
      component.selectAnimal(mockAnimals[0]);
      expect(component.selectedAnimal).toEqual(mockAnimals[0]);
    });

  });

});
