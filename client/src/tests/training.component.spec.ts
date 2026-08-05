/**
 * training.component.spec.ts
 * Unit tests for TrainingComponent
 * Angular 21 + Vitest
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { TrainingComponent, Training } from '../app/training/training';
import { TrainingService } from '../app/services/training';
import { AuthService } from '../app/services/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';

describe('TrainingComponent', () => {
  let component: TrainingComponent;
  let trainingServiceMock: any;
  let authServiceMock: any;
  let routerMock: any;
  let routeMock: any;

  const mockTraining: Training = {
    _id: '123',
    animal_id: 'A100',
    rescue_type: 'Water Rescue',
    training_status: 'Completed',
    training_level: 'Advanced',
    trainer_id: 'T001',
    trainer_name: 'John Smith',
    start_date: '2026-01-01',
    completion_date: '2026-01-10',
    score: 95,
    notes: 'Excellent performance'
  };

  beforeEach(() => {
    trainingServiceMock = {
      getTraining: vi.fn().mockReturnValue(of([])),
      getAnimalTraining: vi.fn().mockReturnValue(of([])),
      getTrainingById: vi.fn().mockReturnValue(of(mockTraining)),
      createTraining: vi.fn().mockReturnValue(of(mockTraining)),
      updateTraining: vi.fn().mockReturnValue(of(mockTraining)),
      deleteTraining: vi.fn().mockReturnValue(of({}))
    };

    authServiceMock = {
      isLoggedIn: vi.fn().mockReturnValue(true),
      canEdit: vi.fn().mockReturnValue(true)
    };

    routerMock = {
      navigate: vi.fn()
    };

    routeMock = {
      paramMap: of({
        get: () => null
      }),
      queryParams: of({})
    };

    TestBed.configureTestingModule({
      imports: [TrainingComponent],
      providers: [
        { provide: TrainingService, useValue: trainingServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: routeMock },
        ChangeDetectorRef
      ]
    });

    component = TestBed.createComponent(
      TrainingComponent
    ).componentInstance;
  });

  describe('ngOnInit()', () => {
    it('loads training records when user is authenticated', () => {
      component.ngOnInit();

      expect(
        trainingServiceMock.getTraining
      ).toHaveBeenCalled();
    });

    it('does not load records when user is not authenticated', () => {
      authServiceMock.isLoggedIn.mockReturnValue(false);

      component.ngOnInit();

      expect(
        trainingServiceMock.getTraining
      ).not.toHaveBeenCalled();
    });
  });

  describe('loadTraining()', () => {
    it('loads training records successfully', () => {
      trainingServiceMock.getTraining
        .mockReturnValue(of([mockTraining]));

      component.loadTraining();

      expect(
        component.trainingRecords.length
      ).toBe(1);

      expect(
        component.trainingRecords[0]
      ).toEqual(mockTraining);
    });

    it('handles loading errors', () => {
      trainingServiceMock.getTraining
        .mockReturnValue(
          throwError(() => ({
            status: 500
          }))
        );

      component.loadTraining();

      expect(
        component.trainingRecords
      ).toEqual([]);
    });
  });

  describe('loadAnimalTraining()', () => {
    it('loads training history for animal', () => {
      trainingServiceMock.getAnimalTraining
        .mockReturnValue(of([mockTraining]));

      component.loadAnimalTraining('A100');

      expect(
        trainingServiceMock.getAnimalTraining
      ).toHaveBeenCalledWith('A100');

      expect(
        component.trainingRecords[0]
      ).toEqual(mockTraining);
    });
  });

  describe('loadTrainingForEdit()', () => {
    it('loads training record into form', () => {
      component.loadTrainingForEdit('123');

      expect(
        trainingServiceMock.getTrainingById
      ).toHaveBeenCalledWith('123');

      expect(
        component.editingTrainingId
      ).toBe('123');

      expect(
        component.newTraining.animal_id
      ).toBe('A100');
    });
  });

  describe('addTraining()', () => {
    it('creates training record', () => {
      component.newTraining = mockTraining;

      component.addTraining();

      expect(
        trainingServiceMock.createTraining
      ).toHaveBeenCalledWith(mockTraining);
    });

    it('updates training record', () => {
      component.editingTrainingId = '123';
      component.newTraining = mockTraining;

      component.addTraining();

      expect(
        trainingServiceMock.updateTraining
      ).toHaveBeenCalledWith(
        '123',
        mockTraining
      );
    });
  });

  describe('editTraining()', () => {
    it('loads selected training into form', () => {
      component.editTraining(mockTraining);

      expect(
        component.editingTrainingId
      ).toBe('123');

      expect(
        component.newTraining.animal_id
      ).toBe('A100');
    });
  });

  describe('deleteTraining()', () => {
    it('deletes training record', () => {
      vi.stubGlobal(
        'confirm',
        vi.fn(() => true)
      );

      component.deleteTraining('123');

      expect(
        trainingServiceMock.deleteTraining
      ).toHaveBeenCalledWith('123');
    });
  });

  describe('resetForm()', () => {
    it('clears form and editing state', () => {
      component.editingTrainingId = '123';
      component.resetForm();

      expect(
        component.editingTrainingId
      ).toBeNull();

      expect(
        component.newTraining.animal_id
      ).toBe('');
    });
  });

  describe('goBackToHistory()', () => {
    it('navigates to training history', () => {
      component.goBackToHistory();

      expect(
        routerMock.navigate
      ).toHaveBeenCalled();
    });
  });
});
