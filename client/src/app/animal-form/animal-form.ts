/**
 * animal-form.ts - Create and edit form for animal records
 * Handles both POST (create) and PUT (update) operations.
 * Used by the Grazioso Salvare dashboard CRUD functionality.
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AnimalService, Animal } from '../services/animal';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-animal-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './animal-form.html',
  styleUrls: ['./animal-form.scss']
})
export class AnimalForm implements OnInit {
  // Success message displayed after successful save operation
  successMessage = '';

  // Animal ID from route parameter; null when creating new animal
  id: string | null = null;

  // Animal object being created or edited (Partial allows form-bound fields)
  animal: Partial<Animal> = {
    animal_id: '',
    name: '',
    breed: '',
    animal_type: '',
    color: '',
    sex_upon_outcome: '',
    age_upon_outcome: '',
    outcome_type: '',
    outcome_subtype: '',
    date_of_birth: '',
    datetime: '',
    age_upon_outcome_in_weeks: 0,
    location_lat: 0,
    location_long: 0
  };

  constructor(
    private animalService: AnimalService, // Service for animal API operations
    private route: ActivatedRoute,        // For accessing route parameters
    private router: Router,               // For navigation
    private cdr: ChangeDetectorRef        // For manual change detection
  ) {}

  /**
   * Lifecycle hook that initializes the component
   * Checks if editing an existing animal (has ID) or creating a new one
   * If editing, loads the animal data from the service
   */
  ngOnInit(): void {
    // Get animal ID from route parameter
    this.id = this.route.snapshot.paramMap.get('id');

    // Edit mode - load existing animal data
    if (this.id) {
      this.animalService
        .getAnimalById(this.id)
        .subscribe({
          next: (data) => {
            this.animal = data;
            this.cdr.detectChanges(); // Manually trigger change detection after data load
          },
          error: (err) => {
            console.error(err);
          }
        });
    }
  }

  /**
   * Saves the animal record
   * Calculates age in weeks, validates the form,
   * then either creates a new animal or updates existing one
   * Displays success message and navigates to dashboard after 2 seconds
   */
  save(): void {
    // Calculate age in weeks before saving
    this.calculateAgeInWeeks();
       
    // Validate all required fields are filled
    if (!this.validateForm()) {
      return;
    }

    // Update existing animal
    if (this.id) {
      this.animalService
        .updateAnimal(
          this.id,
          this.animal as Animal
        )
        .subscribe({
          next: () => {
            this.successMessage = 'Animal record updated successfully.';
            this.cdr.detectChanges();
            // Navigate to dashboard after 2 second delay
            setTimeout(() => {
              this.router.navigate(['/dashboard']);
            }, 2000);
          }
        });
    }

    // Create new animal
    else {
      this.animalService
        .createAnimal(
          this.animal as Animal
        )
        .subscribe({
          next: () => {
            this.successMessage = 'Animal record created successfully.';
            this.cdr.detectChanges();
            // Navigate to dashboard after 2 second delay
            setTimeout(() => {
              this.router.navigate(['/dashboard']);
            }, 2000);
          }
        });
    }
  }

  /**
   * Cancels the form operation and navigates back to dashboard
   * Discards any unsaved changes
   */
  cancel(): void {
    this.router.navigate(['/dashboard']);
  }

  /**
   * Validates that all required fields are filled in the animal object
   * Checks for undefined, null, or empty string values
   * Displays an alert with the field name if validation fails
   * @returns {boolean} True if all required fields are valid, false otherwise
   */
  validateForm(): boolean {
    // List of all required fields that must have values
    const requiredFields = [
      'animal_id',
      'name',
      'breed',
      'animal_type',
      'color',
      'sex_upon_outcome',
      'age_upon_outcome',
      'outcome_type',
      'outcome_subtype',
      'date_of_birth',
      'datetime',
      'age_upon_outcome_in_weeks',
      'location_lat',
      'location_long'
    ];

    // Check each required field for valid value
    for (const field of requiredFields) {
      if (
        this.animal[field] === undefined ||
        this.animal[field] === null ||
        this.animal[field] === ''
      ) {
        alert(`${field} is required`); // Alert user about missing field
        return false;
      }
    }

    return true; // All fields are valid
  }

  /**
   * Calculates the animal's age in weeks based on date_of_birth and datetime
   * Computes the difference between outcome date and birth date
   * Rounds to the nearest whole week
   * Sets age_upon_outcome_in_weeks to 0 if either date is missing
   */
  calculateAgeInWeeks(): void {
    // Check if both dates are available
    if (
      !this.animal.date_of_birth ||
      !this.animal.datetime
    ) {
      this.animal.age_upon_outcome_in_weeks = 0;
      return;
    }

    // Calculate age in weeks
    const birthDate = new Date(this.animal.date_of_birth);
    const outcomeDate = new Date(this.animal.datetime);
    const difference = outcomeDate.getTime() - birthDate.getTime(); // Difference in milliseconds
    const weeks = difference / (1000 * 60 * 60 * 24 * 7);           // Convert ms to weeks
    this.animal.age_upon_outcome_in_weeks = Math.round(weeks);      // Round to nearest whole week
  }
}
