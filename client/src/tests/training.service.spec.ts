/**
 * training.service.spec.ts
 * Unit tests for TrainingService
 * Angular 21 + Vitest
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of, throwError, firstValueFrom } from 'rxjs';
import { TrainingService } from '../app/services/training';
import { Training } from '../app/training/training';

describe('TrainingService', () => {
  let service: TrainingService;
  let httpClientMock: any;

  const mockTraining: Training = {
    _id: '123',
    animal_id: 'A123',
    rescue_type: 'Water Rescue',
    training_status: 'Completed',
    training_level: 'Advanced',
    trainer_id: 'T001',
    trainer_name: 'John Smith',
    start_date: '2026-01-01',
    score: 95,
    notes: 'Completed successfully'
  };

  beforeEach(() => {
    httpClientMock = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        TrainingService,
        { provide: HttpClient, useValue: httpClientMock }
      ]
    });

    service = TestBed.inject(TrainingService);
  });

  //
  // GET /api/training
  //

  describe('getTraining()', () => {
    it('returns training records', async () => {
      httpClientMock.get.mockReturnValue(of([mockTraining]));

      const result = await firstValueFrom(service.getTraining());

      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual([mockTraining]);
      expect(result[0]._id).toBe('123');

      expect(httpClientMock.get).toHaveBeenCalledWith(
        'http://localhost:3000/api/training'
      );
    });

    it('returns empty array when no records exist', async () => {
      httpClientMock.get.mockReturnValue(of([]));

      const result = await firstValueFrom(service.getTraining());

      expect(result.length).toBe(0);
      expect(Array.isArray(result)).toBe(true);
    });

    it('returns backend error', async () => {
      const errorResponse = {
        status: 500,
        statusText: 'Internal Server Error'
      };

      httpClientMock.get.mockReturnValue(
        throwError(() => errorResponse)
      );

      await expect(firstValueFrom(service.getTraining())).rejects.toMatchObject({
        status: 500
      });
    });
  });

  //
  // GET /api/training/:animalId
  //

  describe('getAnimalTraining()', () => {
    it('returns training records for animal', async () => {
      httpClientMock.get.mockReturnValue(of([mockTraining]));

      const result = await firstValueFrom(
        service.getAnimalTraining('A123')
      );

      expect(result).toEqual([mockTraining]);

      expect(httpClientMock.get).toHaveBeenCalledWith(
        'http://localhost:3000/api/training/A123'
      );
    });

    it('returns 404 when animal has no history', async () => {
      const errorResponse = {
        status: 404,
        statusText: 'Not Found'
      };

      httpClientMock.get.mockReturnValue(
        throwError(() => errorResponse)
      );

      await expect(
        firstValueFrom(service.getAnimalTraining('BAD'))
      ).rejects.toMatchObject({
        status: 404
      });
    });
  });

  //
  // GET /api/training/id/:id
  //

  describe('getTrainingById()', () => {
    it('returns one training record', async () => {
      httpClientMock.get.mockReturnValue(of(mockTraining));

      const result = await firstValueFrom(
        service.getTrainingById('123')
      );

      expect(result).toEqual(mockTraining);

      expect(httpClientMock.get).toHaveBeenCalledWith(
        'http://localhost:3000/api/training/id/123'
      );
    });

    it('returns 404 for invalid id', async () => {
      const errorResponse = {
        status: 404,
        statusText: 'Not Found'
      };

      httpClientMock.get.mockReturnValue(
        throwError(() => errorResponse)
      );

      await expect(
        firstValueFrom(service.getTrainingById('bad'))
      ).rejects.toMatchObject({
        status: 404
      });
    });
  });

  //
  // POST /api/training
  //

  describe('createTraining()', () => {
    it('creates training record', async () => {
      httpClientMock.post.mockReturnValue(of(mockTraining));

      const result = await firstValueFrom(
        service.createTraining(mockTraining)
      );

      expect(result).toEqual(mockTraining);

      expect(httpClientMock.post).toHaveBeenCalledWith(
        'http://localhost:3000/api/training',
        mockTraining
      );
    });

    it('returns validation error', async () => {
      const errorResponse = {
        status: 400,
        statusText: 'Bad Request'
      };

      httpClientMock.post.mockReturnValue(
        throwError(() => errorResponse)
      );

      await expect(
        firstValueFrom(service.createTraining(mockTraining))
      ).rejects.toMatchObject({
        status: 400
      });
    });
  });

  //
  // PUT /api/training/:id
  //

  describe('updateTraining()', () => {
    it('updates training record', async () => {
      httpClientMock.put.mockReturnValue(of(mockTraining));

      const result = await firstValueFrom(
        service.updateTraining('123', mockTraining)
      );

      expect(result).toEqual(mockTraining);

      expect(httpClientMock.put).toHaveBeenCalledWith(
        'http://localhost:3000/api/training/123',
        mockTraining
      );
    });
  });

  //
  // DELETE /api/training/:id
  //

  describe('deleteTraining()', () => {
    it('deletes training record', async () => {
      httpClientMock.delete.mockReturnValue(of({ message: 'Deleted' }));

      const result = await firstValueFrom(
        service.deleteTraining('123')
      );

      expect(result).toEqual({
        message: 'Deleted'
      });

      expect(httpClientMock.delete).toHaveBeenCalledWith(
        'http://localhost:3000/api/training/123'
      );
    });

    it('returns delete error', async () => {
      const errorResponse = {
        status: 500,
        statusText: 'Internal Server Error'
      };

      httpClientMock.delete.mockReturnValue(
        throwError(() => errorResponse)
      );

      await expect(
        firstValueFrom(service.deleteTraining('123'))
      ).rejects.toMatchObject({
        status: 500
      });
    });
  });
});
