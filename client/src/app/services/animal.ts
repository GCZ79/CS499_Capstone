/**
 * animal.service.ts - Service for animal data operations
 * Provides methods for CRUD operations, search, filtering, and breed distribution
 * Interacts with the backend API for all animal-related functionality
 * Mirrors the original Python dashboard's data layer
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';

// ============================================
// INTERFACES
// ============================================

/**
 * Describes what a single animal document looks like
 * Matches the MongoDB schema from the backend
 */
export interface Animal {
  _id: string;
  animal_id: string;
  name: string;
  breed: string;
  animal_type: string;
  color: string;
  sex_upon_outcome: string;
  age_upon_outcome: string;
  outcome_type: string;
  outcome_subtype: string;
  date_of_birth: string;
  datetime: string;
  age_upon_outcome_in_weeks: number;
  location_lat: number;
  location_long: number;
  [key: string]: any;          // Allows for additional dynamic properties
}

/**
 * Describes the paginated response from GET /api/animals
 * Contains the animal records array and pagination metadata
 */
export interface AnimalResponse {
  animals: Animal[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Describes one entry in the breed distribution response
 * Used for the chart component visualization
 */
export interface BreedCount {
  breed: string;
  count: number;
}

// ============================================
// SERVICE
// ============================================

@Injectable({ providedIn: 'root' })
export class AnimalService {

  /**
   * Base API URL from environment configuration
   */
  private base = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // ============================================
  // SEARCH OPERATIONS
  // ============================================

  /**
   * Search for animals using filter criteria
   * @param {any} filters - Object containing search filter key-value pairs
   * @returns {Observable<AnimalResponse>} Observable containing matching animals and pagination info
   * 
   * API Endpoint: GET /api/animals/search?filter1=value1&filter2=value2
   */
  searchAnimals(filters: any): Observable<AnimalResponse> {
    let params = new HttpParams();
    
    // Build query parameters from filter object (skip empty values)
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params = params.set(key, filters[key]);
      }
    });

    return this.http.get<AnimalResponse>(`${this.base}/animals/search`, { params });
  }

  // ============================================
  // DATA FETCHING
  // ============================================

  /**
   * Calls GET /api/animals?rescueType=...&page=...&pageSize=...
   * Mirrors original shelter.read(query) -> df.to_dict('records')
   * Fetches paginated animal records filtered by rescue type
   * 
   * @param {string} rescueType - Filter by rescue type (water, mountain, disaster, reset)
   * @param {number} page - Page number for pagination (0-based)
   * @param {number} pageSize - Number of records per page
   * @returns {Observable<AnimalResponse>} Observable containing animals and pagination info
   * 
   * API Endpoint: GET /api/animals?rescueType=...&page=...&pageSize=...
   */
  getAnimals(rescueType: string, page: number, pageSize: number): Observable<AnimalResponse> {
    // Build query parameters
    const params = new HttpParams()
      .set('rescueType', rescueType)
      .set('page', page.toString())
      .set('pageSize', pageSize.toString())
      .set('_t', Date.now().toString()); // Cache-busting query param to avoid browser caching issues

    return this.http.get<AnimalResponse>(
      `${this.base}/animals`,
      { params }
    );
  }

  /**
   * Calls GET /api/animals/breeds?rescueType=...
   * Mirrors original pie chart callback
   * Fetches breed distribution data for the specified rescue type
   * 
   * @param {string} rescueType - Filter by rescue type (water, mountain, disaster)
   * @returns {Observable<BreedCount[]>} Observable containing array of breed counts
   * 
   * API Endpoint: GET /api/animals/breeds?rescueType=...
   */
  getBreedDistribution(rescueType: string): Observable<BreedCount[]> {
    const params = new HttpParams().set('rescueType', rescueType);
    return this.http.get<BreedCount[]>(`${this.base}/animals/breeds`, { params });
  }

  /**
   * Calls GET /api/animals/:id
   * Used when a row is selected to center the map
   * Fetches a single animal record by its ID
   * 
   * @param {string} id - Animal ID to fetch
   * @returns {Observable<Animal>} Observable containing the animal record
   * 
   * API Endpoint: GET /api/animals/:id
   */
  getAnimalById(id: string): Observable<Animal> {
    return this.http.get<Animal>(`${this.base}/animals/${id}`);
  }

  // ============================================
  // CRUD OPERATIONS
  // ============================================

  /**
   * Calls POST /api/animals
   * Creates a new animal record in the database
   * 
   * @param {Animal} animal - Animal object to create
   * @returns {Observable<Animal>} Observable containing the created animal
   * 
   * API Endpoint: POST /api/animals
   */
  createAnimal(animal: Animal): Observable<Animal> {
    return this.http.post<Animal>(
      `${this.base}/animals`,
      animal
    );
  }

  /**
   * Calls PUT /api/animals/:id
   * Updates an existing animal record by its ID
   * 
   * @param {string} id - Animal ID to update
   * @param {Animal} animal - Updated animal data
   * @returns {Observable<Animal>} Observable containing the updated animal
   * 
   * API Endpoint: PUT /api/animals/:id
   */
  updateAnimal(id: string, animal: Animal): Observable<Animal> {
    return this.http.put<Animal>(
      `${this.base}/animals/${id}`,
      animal
    );
  }

  /**
   * Calls DELETE /api/animals/:id
   * Deletes an animal record from the database by its ID
   * 
   * @param {string} id - Animal ID to delete
   * @returns {Observable<any>} Observable indicating success/failure
   * 
   * API Endpoint: DELETE /api/animals/:id
   */
  deleteAnimal(id: string): Observable<any> {
    return this.http.delete(
      `${this.base}/animals/${id}`
    );
  }
}
