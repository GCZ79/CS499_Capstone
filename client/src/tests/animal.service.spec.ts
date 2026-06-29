/**
 * animal.service.spec.ts
 * Unit tests for AnimalService
 * Angular 21 + Vitest
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';

import {
  AnimalService,
  Animal,
  AnimalResponse,
  BreedCount
} from '../app/services/animal';

import { environment } from '../environments/environments';

describe('AnimalService', () => {

  let service: AnimalService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AnimalService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(AnimalService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  //
  // GET /api/animals
  //

  describe('getAnimals()', () => {

    it('returns expected response shape', () => {

      service.getAnimals('reset', 0, 10).subscribe((res: AnimalResponse) => {
        expect(res).toHaveProperty('animals');
        expect(res).toHaveProperty('total');
        expect(res).toHaveProperty('page');
        expect(res).toHaveProperty('pageSize');
        expect(Array.isArray(res.animals)).toBe(true);
      });

      const req = httpMock.expectOne(
        r => r.url === `${environment.apiUrl}/animals`
      );

      expect(req.request.method).toBe('GET');

      req.flush({
        animals: [],
        total: 0,
        page: 0,
        pageSize: 10
      });

    });

    it('sends correct rescueType parameter', () => {

      service.getAnimals('water', 0, 10).subscribe();

      const req = httpMock.expectOne(
        r => r.url === `${environment.apiUrl}/animals`
      );

      expect(req.request.params.get('rescueType')).toBe('water');

      req.flush({
        animals: [],
        total: 0,
        page: 0,
        pageSize: 10
      });

    });

    it('sends correct page parameter', () => {

      service.getAnimals('reset', 2, 10).subscribe();

      const req = httpMock.expectOne(
        r => r.url === `${environment.apiUrl}/animals`
      );

      expect(req.request.params.get('page')).toBe('2');

      req.flush({
        animals: [],
        total: 0,
        page: 2,
        pageSize: 10
      });

    });

    it('sends correct pageSize parameter', () => {

      service.getAnimals('reset', 0, 5).subscribe();

      const req = httpMock.expectOne(
        r => r.url === `${environment.apiUrl}/animals`
      );

      expect(req.request.params.get('pageSize')).toBe('5');

      req.flush({
        animals: [],
        total: 0,
        page: 0,
        pageSize: 5
      });

    });

    it('includes cache-busting parameter', () => {

      service.getAnimals('reset', 0, 10).subscribe();

      const req = httpMock.expectOne(
        r => r.url === `${environment.apiUrl}/animals`
      );

      expect(req.request.params.has('_t')).toBe(true);

      req.flush({
        animals: [],
        total: 0,
        page: 0,
        pageSize: 10
      });

    });

    it('returns 400 for invalid rescue type', () => {

      service.getAnimals('invalid', 0, 10).subscribe({
        next: () => {
          throw new Error('Expected request to fail.');
        },
        error: err => {
          expect(err.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(
        r => r.url === `${environment.apiUrl}/animals`
      );

      req.flush(
        { error: 'Invalid rescue type' },
        {
          status: 400,
          statusText: 'Bad Request'
        }
      );

    });

    it('returns network error', () => {

      service.getAnimals('reset', 0, 10).subscribe({
        next: () => {
          throw new Error('Expected request to fail.');
        },
        error: err => {
          expect(err.status).toBe(0);
        }
      });

      const req = httpMock.expectOne(
        r => r.url === `${environment.apiUrl}/animals`
      );

      req.error(new ProgressEvent('Network error'));

    });

  });

  //
  // GET /api/animals/breeds
  //

  describe('getBreedDistribution()', () => {

    it('returns array of breed counts', () => {

      service.getBreedDistribution('water').subscribe((res: BreedCount[]) => {
        expect(Array.isArray(res)).toBe(true);
      });

      const req = httpMock.expectOne(
        r => r.url === `${environment.apiUrl}/animals/breeds`
      );

      expect(req.request.method).toBe('GET');

      req.flush([
        { breed: 'Labrador', count: 10 },
        { breed: 'German Shepherd', count: 8 }
      ]);

    });

    it('sends correct rescueType parameter', () => {

      service.getBreedDistribution('mountain').subscribe();

      const req = httpMock.expectOne(
        r => r.url === `${environment.apiUrl}/animals/breeds`
      );

      expect(req.request.params.get('rescueType')).toBe('mountain');

      req.flush([]);

    });

    it('returns empty array when no results exist', () => {

      service.getBreedDistribution('water').subscribe(res => {
        expect(res.length).toBe(0);
      });

      const req = httpMock.expectOne(
        r => r.url === `${environment.apiUrl}/animals/breeds`
      );

      req.flush([]);

    });

    it('ensures each entry has breed and count fields', () => {

      service.getBreedDistribution('water').subscribe(res => {

        if (res.length > 0) {
          expect(res[0]).toHaveProperty('breed');
          expect(res[0]).toHaveProperty('count');
          expect(typeof res[0].count).toBe('number');
        }

      });

      const req = httpMock.expectOne(
        r => r.url === `${environment.apiUrl}/animals/breeds`
      );

      req.flush([
        { breed: 'Labrador', count: 10 }
      ]);

    });

    it('returns 500 error from backend', () => {

      service.getBreedDistribution('water').subscribe({
        next: () => {
          throw new Error('Expected request to fail.');
        },
        error: err => {
          expect(err.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(
        r => r.url === `${environment.apiUrl}/animals/breeds`
      );

      req.flush(
        { error: 'Server error' },
        {
          status: 500,
          statusText: 'Internal Server Error'
        }
      );

    });

  });

  //
  // GET /api/animals/:id
  //

  describe('getAnimalById()', () => {

    it('returns animal for valid id', () => {

      const mockAnimal: Animal = {
        _id: '123',
        animal_type: 'Dog',
        breed: 'Labrador',
        name: 'Buddy',
        sex_upon_outcome: 'Intact Male',
        age_upon_outcome: '2 years',
        age_upon_outcome_in_weeks: 104,
        outcome_type: 'Adoption',
        location_lat: 30.75,
        location_long: -97.48
      };

      service.getAnimalById('123').subscribe(res => {
        expect(res._id).toBe('123');
        expect(res.name).toBe('Buddy');
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/animals/123`
      );

      expect(req.request.method).toBe('GET');

      req.flush(mockAnimal);

    });

    it('returns 404 for non-existent id', () => {

      const fakeId = '000000000000000000000000';

      service.getAnimalById(fakeId).subscribe({
        next: () => {
          throw new Error('Expected request to fail.');
        },
        error: err => {
          expect(err.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/animals/${fakeId}`
      );

      req.flush(
        { error: 'Not found' },
        {
          status: 404,
          statusText: 'Not Found'
        }
      );

    });

    it('returns 500 for malformed id', () => {

      const badId = 'not-valid';

      service.getAnimalById(badId).subscribe({
        next: () => {
          throw new Error('Expected request to fail.');
        },
        error: err => {
          expect([400, 500]).toContain(err.status);
        }
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/animals/${badId}`
      );

      req.flush(
        { error: 'Server error' },
        {
          status: 500,
          statusText: 'Internal Server Error'
        }
      );

    });

  });
});
