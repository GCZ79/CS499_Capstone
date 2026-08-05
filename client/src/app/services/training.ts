/**
 * training.ts - Service for training data operations
 * Provides methods for CRUD operations on training records
 * Interacts with the backend API for all training-related functionality
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { Training } from '../training/training';

/**
 * Service responsible for managing training-related API operations.
 * Provides methods to create, read, update, and delete training records.
 */
@Injectable({
  providedIn: 'root' // Makes this service available application-wide as a singleton
})
export class TrainingService {

  /** Base URL for the training API endpoints */
  private apiUrl = 'http://localhost:3000/api/training';

  /**
   * Constructor - injects the HttpClient for making HTTP requests
   * @param http - Angular's HTTP client for API communication
   */
  constructor(
    private http: HttpClient
  ) { }

  /**
   * Retrieves all training records from the server
   * @returns Observable emitting an array of Training objects
   */
  getTraining(): Observable<Training[]> {
    return this.http.get<Training[]>(
      this.apiUrl
    );
  }

  /**
   * Retrieves detailed training records from the server
   * @returns Observable emitting an array of Training objects with detailed information
   */
  getTrainingDetails() {
    return this.http.get<Training[]>(
      `${this.apiUrl}/details`
    );
  }

  /**
   * Creates a new training record
   * @param training - The training data to be created (without ID)
   * @returns Observable emitting the created Training object with server-generated ID
   */
  createTraining(
    training: Training
  ): Observable<Training> {
    return this.http.post<Training>(
      this.apiUrl,
      training
    );
  }

  /**
   * Retrieves all training records associated with a specific animal
   * @param animalId - The unique identifier of the animal
   * @returns Observable emitting an array of Training objects for the specified animal
   */
  getAnimalTraining(
    animalId: string
  ): Observable<Training[]> {
    return this.http.get<Training[]>(
      `${this.apiUrl}/${animalId}`
    );
  }

  /**
   * Retrieves one training record by MongoDB ID
   * Used when loading a training record into the edit form
   * @param id - The unique identifier of the training record
   * @returns Observable emitting one Training object
   */
  getTrainingById(
    id: string
  ): Observable<Training> {

    return this.http.get<Training>(
      `${this.apiUrl}/id/${id}`
    );

  }

  /**
   * Updates an existing training record
   * @param id - The unique identifier of the training record to update
   * @param training - Partial Training object containing the fields to update
   * @returns Observable emitting the updated Training object
   */
  updateTraining(
    id: string,
    training: Partial<Training>
  ): Observable<Training> {
    return this.http.put<Training>(
      `${this.apiUrl}/${id}`,
      training
    );
  }

  /**
   * Deletes a training record
   * @param id - The unique identifier of the training record to delete
   * @returns Observable emitting the server response (typically void or deletion confirmation)
   */
  deleteTraining(
    id: string
  ): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/${id}`
    );
  }

}
