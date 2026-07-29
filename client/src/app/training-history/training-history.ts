/**
 * training-history.ts
 *
 * Displays training history records.
 * Supports viewing all records, filtering by animal,
 * editing existing records, and deleting records.
 */

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

import { TrainingService } from '../services/training';
import { Training } from '../training/training';


@Component({
  selector: 'app-training-history',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe
  ],
  templateUrl: './training-history.html',
  styleUrl: './training-history.scss'
})
export class TrainingHistory implements OnInit {

  /** Selected animal ID */
  animalId: string = '';

  /** Training records displayed in table */
  trainingRecords: Training[] = [];
    
  /** Informational message */
  message: string = '';

  /** Error message */
  errorMessage: string = '';


  constructor(
    private route: ActivatedRoute,
    private trainingService: TrainingService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }


  /**
   * Loads training history when component starts.
   *
   * Supports:
   * - Training history for selected animal
   * - All training records
   * - Loading a record for editing
   */
  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {

      const animalId = params['animal_id'];

      // Training history opened from dashboard
      if (animalId) {

        this.animalId = animalId;
        this.loadHistory(animalId);

      }


      // Training history opened directly
      else {

        this.loadAllHistory();

      }

    });

  }


  /**
   * Retrieves training history for selected animal.
   *
   * @param animalId - Animal identifier
   */
  loadHistory(animalId: string): void {

    this.trainingService
      .getAnimalTraining(animalId)
      .subscribe({

        next: (data) => {

          this.trainingRecords = data;

          this.message =
            data.length === 0
              ? 'No training records found for this animal.'
              : '';

          this.errorMessage = '';

          this.cdr.detectChanges();

        },


        error: (error) => {

          this.trainingRecords = [];

          this.errorMessage =
            error.error?.error ||
            'Failed to load training history.';

          this.cdr.detectChanges();

        }

      });

  }


  /**
   * Loads all training records.
   * Used when no animal is selected.
   */
  loadAllHistory(): void {

    this.trainingService
      .getTrainingDetails()
      .subscribe({

        next: (data) => {

          this.trainingRecords = data;

          this.message =
            data.length === 0
              ? 'No training records found.'
              : '';

          this.errorMessage = '';

          this.cdr.detectChanges();

        },


        error: (error) => {

          console.error(
            'TRAINING HISTORY ERROR:',
            error
          );

          this.trainingRecords = [];

          this.errorMessage =
            'Failed to load training records.';

          this.cdr.detectChanges();

        }

      });

  }

  /**
   * Removes animal filter and reloads all training records.
   */
  showAllTraining(): void {

    this.animalId = '';
    this.router.navigate(
      ['/training-history']
    );
  }

  /**
   * Opens training form in edit mode.
   * Navigates to TrainingComponent with selected record ID.
   */
  editTraining(training: Training): void {

    if (!training._id) {
      console.error('Training record has no ID');
      return;
    }

    this.router.navigate([
      '/admin/training/edit',
      training._id
    ]);

  }

  /**
   * Deletes selected training record.
   *
   * @param id - Training record ID
   */
  deleteTraining(id: string): void {


    if (!confirm(
      'Delete this training record?'
    )) {
      return;
    }

    this.trainingService
      .deleteTraining(id)
      .subscribe({

        next: () => {

          // Refresh current table view
          if (this.animalId) {
            this.loadHistory(
              this.animalId
            );
          }

          else {
            this.loadAllHistory();
          }

          this.cdr.detectChanges();
        },

        error: (error) => {
          console.error(
            'Failed to delete training',
            error
          );

          this.errorMessage =
            'Failed to delete training record.';
          this.cdr.detectChanges();
        }
      });
  }
}
