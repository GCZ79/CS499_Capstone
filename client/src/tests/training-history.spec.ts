/**
 * training-history.spec.ts
 * Unit tests for TrainingHistory component
 * Angular 21 + Vitest
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { TrainingHistory } from '../app/training-history/training-history';
import { TrainingService } from '../app/services/training';

describe('TrainingHistory', () => {
  let component: TrainingHistory;
  let trainingServiceMock: any;
  let routerMock: any;

  const mockTraining = [
    {
      _id: '123',
      animal_id: 'A123',
      rescue_type: 'Water Rescue',
      training_status: 'Completed',
      training_level: 'Advanced',
      trainer_id: 'T1',
      trainer_name: 'John Smith',
      start_date: '2026-07-01',
      score: 95
    }
  ];

  beforeEach(async () => {
    vi.stubGlobal(
      'confirm',
      vi.fn(() => true)
    );

    trainingServiceMock = {
      getTraining: vi.fn().mockReturnValue(of([])),
      getAnimalTraining: vi.fn().mockReturnValue(of([])),
      deleteTraining: vi.fn().mockReturnValue(of({}))
    };

    routerMock = {
      navigate: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        TrainingHistory
      ],
      providers: [
        {
          provide: TrainingService,
          useValue: trainingServiceMock
        },
        {
          provide: Router,
          useValue: routerMock
        },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({})
          }
        }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(
      TrainingHistory
    );

    component = fixture.componentInstance;
  });

  describe('ngOnInit()', () => {
    it('loads all training records when no animal filter exists', () => {
      trainingServiceMock.getTraining
        .mockReturnValue(of(mockTraining));

      component.ngOnInit();

      expect(
        trainingServiceMock.getTraining
      ).toHaveBeenCalled();

      expect(
        component.trainingRecords
      ).toEqual(mockTraining);
    });

    it('loads animal history when animal_id exists', () => {
      const route = TestBed.inject(
        ActivatedRoute
      ) as any;

      route.queryParams = of({
        animal_id: 'A123'
      });

      trainingServiceMock.getAnimalTraining
        .mockReturnValue(of(mockTraining));

      component.ngOnInit();

      expect(
        trainingServiceMock.getAnimalTraining
      ).toHaveBeenCalledWith('A123');
    });
  });

  describe('showAllTraining()', () => {
    it('clears animal filter and navigates to all history', () => {
      component.animalId = 'A123';

      component.showAllTraining();

      expect(
        component.animalId
      ).toBe('');

      expect(
        routerMock.navigate
      ).toHaveBeenCalledWith([
        '/training-history'
      ]);
    });
  });

  describe('editTraining()', () => {
    it('navigates to edit page for valid training id', () => {
      component.editTraining(mockTraining[0] as any);

      expect(
        routerMock.navigate
      ).toHaveBeenCalledWith([
        '/admin/training/edit',
        '123'
      ]);
    });
  });

  describe('deleteTraining()', () => {
    it('deletes training record', () => {
      trainingServiceMock.deleteTraining
        .mockReturnValue(of({}));

      component.deleteTraining('123');

      expect(
        trainingServiceMock.deleteTraining
      ).toHaveBeenCalledWith('123');
    });

    it('handles delete errors', () => {
      trainingServiceMock.deleteTraining
        .mockReturnValue(
          throwError(() => ({
            error: {
              error: 'Delete failed'
            }
          }))
        );

      component.deleteTraining('123');

      expect(
        trainingServiceMock.deleteTraining
      ).toHaveBeenCalledWith('123');
    });
  });
});
