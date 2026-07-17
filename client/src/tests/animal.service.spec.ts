/**
 * animal.service.spec.ts
 * Unit tests for AnimalService
 * Angular 21 + Vitest
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of, throwError, firstValueFrom } from 'rxjs';
import {
  AnimalService,
  Animal,
  AnimalResponse,
  BreedCount
} from '../app/services/animal';
import { environment } from '../environments/environments';

describe('AnimalService', () => {
  let service: AnimalService;
  let httpClientMock: any;

  beforeEach(() => {
    // Create a mock HttpClient
    httpClientMock = {
      get: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        AnimalService,
        { provide: HttpClient, useValue: httpClientMock }
      ]
    });

    service = TestBed.inject(AnimalService);
  });

  //
  // GET /api/animals
  //

  describe('getAnimals()', () => {

    it('returns expected response shape', async () => {
      const mockResponse: AnimalResponse = {
        animals: [],
        total: 0,
        page: 0,
        pageSize: 10
      };

      httpClientMock.get.mockReturnValue(of(mockResponse));

      const result = await firstValueFrom(service.getAnimals('reset', 0, 10));
      
      expect(result).toHaveProperty('animals');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('page');
      expect(result).toHaveProperty('pageSize');
      expect(Array.isArray(result.animals)).toBe(true);
      expect(result).toEqual(mockResponse);

      // Verify the HTTP call was made with correct parameters
      expect(httpClientMock.get).toHaveBeenCalledWith(
        `${environment.apiUrl}/animals`,
        expect.objectContaining({
          params: expect.any(Object)
        })
      );
    });

    it('sends correct rescueType parameter', async () => {
      const mockResponse: AnimalResponse = {
        animals: [],
        total: 0,
        page: 0,
        pageSize: 10
      };

      httpClientMock.get.mockReturnValue(of(mockResponse));

      await firstValueFrom(service.getAnimals('water', 0, 10));

      // Verify the params include rescueType
      const callArgs = httpClientMock.get.mock.calls[0];
      expect(callArgs[1].params.get('rescueType')).toBe('water');
    });

    it('sends correct page parameter', async () => {
      const mockResponse: AnimalResponse = {
        animals: [],
        total: 0,
        page: 2,
        pageSize: 10
      };

      httpClientMock.get.mockReturnValue(of(mockResponse));

      await firstValueFrom(service.getAnimals('reset', 2, 10));

      const callArgs = httpClientMock.get.mock.calls[0];
      expect(callArgs[1].params.get('page')).toBe('2');
    });

    it('sends correct pageSize parameter', async () => {
      const mockResponse: AnimalResponse = {
        animals: [],
        total: 0,
        page: 0,
        pageSize: 5
      };

      httpClientMock.get.mockReturnValue(of(mockResponse));

      await firstValueFrom(service.getAnimals('reset', 0, 5));

      const callArgs = httpClientMock.get.mock.calls[0];
      expect(callArgs[1].params.get('pageSize')).toBe('5');
    });

    it('includes cache-busting parameter', async () => {
      const mockResponse: AnimalResponse = {
        animals: [],
        total: 0,
        page: 0,
        pageSize: 10
      };

      httpClientMock.get.mockReturnValue(of(mockResponse));

      await firstValueFrom(service.getAnimals('reset', 0, 10));

      const callArgs = httpClientMock.get.mock.calls[0];
      expect(callArgs[1].params.has('_t')).toBe(true);
    });

    it('returns 400 for invalid rescue type', async () => {
      const errorResponse = {
        status: 400,
        statusText: 'Bad Request',
        error: { error: 'Invalid rescue type' }
      };

      httpClientMock.get.mockReturnValue(throwError(() => errorResponse));

      await expect(firstValueFrom(service.getAnimals('invalid', 0, 10))).rejects.toMatchObject({
        status: 400
      });
    });

    it('returns network error', async () => {
      const errorResponse = {
        status: 0,
        statusText: 'Network Error'
      };

      httpClientMock.get.mockReturnValue(throwError(() => errorResponse));

      await expect(firstValueFrom(service.getAnimals('reset', 0, 10))).rejects.toMatchObject({
        status: 0
      });
    });

  });

  //
  // GET /api/animals/breeds
  //

  describe('getBreedDistribution()', () => {

    it('returns array of breed counts', async () => {
      const mockBreeds: BreedCount[] = [
        { breed: 'Labrador', count: 10 },
        { breed: 'German Shepherd', count: 8 }
      ];

      httpClientMock.get.mockReturnValue(of(mockBreeds));

      const result = await firstValueFrom(service.getBreedDistribution('water'));
      
      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual(mockBreeds);

      const callArgs = httpClientMock.get.mock.calls[0];
      expect(callArgs[1].params.get('rescueType')).toBe('water');
    });

    it('sends correct rescueType parameter', async () => {
      httpClientMock.get.mockReturnValue(of([]));

      await firstValueFrom(service.getBreedDistribution('mountain'));

      const callArgs = httpClientMock.get.mock.calls[0];
      expect(callArgs[1].params.get('rescueType')).toBe('mountain');
    });

    it('returns empty array when no results exist', async () => {
      httpClientMock.get.mockReturnValue(of([]));

      const result = await firstValueFrom(service.getBreedDistribution('water'));
      
      expect(result.length).toBe(0);
      expect(Array.isArray(result)).toBe(true);
    });

    it('ensures each entry has breed and count fields', async () => {
      const mockBreeds: BreedCount[] = [
        { breed: 'Labrador', count: 10 }
      ];

      httpClientMock.get.mockReturnValue(of(mockBreeds));

      const result = await firstValueFrom(service.getBreedDistribution('water'));
      
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('breed');
      expect(result[0]).toHaveProperty('count');
      expect(typeof result[0].count).toBe('number');
    });

    it('returns 500 error from backend', async () => {
      const errorResponse = {
        status: 500,
        statusText: 'Internal Server Error',
        error: { error: 'Server error' }
      };

      httpClientMock.get.mockReturnValue(throwError(() => errorResponse));

      await expect(firstValueFrom(service.getBreedDistribution('water'))).rejects.toMatchObject({
        status: 500
      });
    });

  });

  //
  // GET /api/animals/:id
  //

  describe('getAnimalById()', () => {

    it('returns animal for valid id', async () => {
      const mockAnimal: Animal = {
        _id: '123',
        animal_id: 'A123456',
        animal_type: 'Dog',
        breed: 'Labrador',
        name: 'Buddy',
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
      };

      httpClientMock.get.mockReturnValue(of(mockAnimal));

      const result = await firstValueFrom(service.getAnimalById('123'));
      
      expect(result._id).toBe('123');
      expect(result.name).toBe('Buddy');
      expect(result).toEqual(mockAnimal);

      expect(httpClientMock.get).toHaveBeenCalledWith(
        `${environment.apiUrl}/animals/123`
      );
    });

    it('returns 404 for non-existent id', async () => {
      const fakeId = '000000000000000000000000';
      const errorResponse = {
        status: 404,
        statusText: 'Not Found',
        error: { error: 'Not found' }
      };

      httpClientMock.get.mockReturnValue(throwError(() => errorResponse));

      await expect(firstValueFrom(service.getAnimalById(fakeId))).rejects.toMatchObject({
        status: 404
      });
    });

    it('returns 500 for malformed id', async () => {
      const badId = 'not-valid';
      const errorResponse = {
        status: 500,
        statusText: 'Internal Server Error',
        error: { error: 'Server error' }
      };

      httpClientMock.get.mockReturnValue(throwError(() => errorResponse));

      await expect(firstValueFrom(service.getAnimalById(badId))).rejects.toMatchObject({
        status: 500
      });
    });

  });
});
