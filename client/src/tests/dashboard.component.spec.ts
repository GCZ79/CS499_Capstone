/**
 * dashboard.component.spec.ts
 * Unit tests for DashboardComponent (Angular 21 + Vitest style)
 * AnimalService is mocked to avoid HTTP calls.
 */

import { describe, it, expect, beforeEach } from 'vitest';

import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { DashboardComponent } from '../app/components/dashboard/dashboard';
import { AnimalService, Animal, AnimalResponse, BreedCount } from '../app/services/animal';

import { of } from 'rxjs';

describe('DashboardComponent', () => {

  let component: DashboardComponent;
  let animalService: {
    getAnimals: ReturnType<typeof vi.fn>;
    getBreedDistribution: ReturnType<typeof vi.fn>;
  };

  const mockAnimals: Animal[] = [
    {
      _id: '1',
      name: 'Buddy',
      breed: 'Labrador',
      animal_type: 'Dog',
      sex_upon_outcome: 'Intact Male',
      age_upon_outcome: '2 years',
      age_upon_outcome_in_weeks: 104,
      outcome_type: 'Adoption',
      location_lat: 30.75,
      location_long: -97.48
    },
    {
      _id: '2',
      name: 'Max',
      breed: 'German Shepherd',
      animal_type: 'Dog',
      sex_upon_outcome: 'Intact Male',
      age_upon_outcome: '3 years',
      age_upon_outcome_in_weeks: 156,
      outcome_type: 'Transfer',
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

    animalService = {
      getAnimals: vi.fn(),
      getBreedDistribution: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: AnimalService, useValue: animalService },
        provideRouter([])
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  //
  // INITIALIZATION
  //

  describe('Initialization', () => {

    it('creates component', () => {
      animalService.getAnimals.mockReturnValue(of(mockResponse));
      expect(component).toBeTruthy();
    });

    it('loads animals on init', async () => {
      animalService.getAnimals.mockReturnValue(of(mockResponse));

      component.ngOnInit();

      expect(animalService.getAnimals).toHaveBeenCalledWith('reset', 0, 10);
      expect(component.animals.length).toBe(2);
      expect(component.total).toBe(2);
      expect(component.loading).toBe(false);
    });

    it('sets error on failure', async () => {
      animalService.getAnimals.mockReturnValue(
        new (await import('rxjs')).Observable(sub => sub.error(new Error('fail')))
      );

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
    });

    it('calls API with correct filter', () => {
      animalService.getAnimals.mockReturnValue(of(mockResponse));
      animalService.getBreedDistribution.mockReturnValue(of(mockBreedData));

      component.selectRescueType('mountain');

      expect(animalService.getAnimals).toHaveBeenCalledWith('mountain', 0, 10);
    });

    it('loads breed data when not reset', () => {
      animalService.getAnimals.mockReturnValue(of(mockResponse));
      animalService.getBreedDistribution.mockReturnValue(of(mockBreedData));

      component.selectRescueType('water');

      expect(animalService.getBreedDistribution).toHaveBeenCalledWith('water');
      expect(component.breedData).toEqual(mockBreedData);
    });

    it('clears breed data on reset', () => {
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
