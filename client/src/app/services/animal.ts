import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';

// Describes what a single animal document looks like
export interface Animal {
  _id: string;
  animal_type: string;
  breed: string;
  name: string;
  sex_upon_outcome: string;
  age_upon_outcome: string;
  age_upon_outcome_in_weeks: number;
  outcome_type: string;
  location_lat: number;
  location_long: number;
  [key: string]: any;
}

// Describes the paginated response from GET /api/animals
export interface AnimalResponse {
  animals: Animal[];
  total: number;
  page: number;
  pageSize: number;
}

// Describes one entry in the breed distribution response
export interface BreedCount {
  breed: string;
  count: number;
}

@Injectable({ providedIn: 'root' })
export class AnimalService {

  private base = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Calls GET /api/animals?rescueType=...&page=...&pageSize=...
  // Mirrors original shelter.read(query) -> df.to_dict('records')
  getAnimals(rescueType: string, page: number, pageSize: number): Observable<AnimalResponse> {
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

  // Calls GET /api/animals/breeds?rescueType=...
  // Mirrors original pie chart callback
  getBreedDistribution(rescueType: string): Observable<BreedCount[]> {
    const params = new HttpParams().set('rescueType', rescueType);
    return this.http.get<BreedCount[]>(`${this.base}/animals/breeds`, { params });
  }

  // Calls GET /api/animals/:id
  // Used when a row is selected to center the map
  getAnimalById(id: string): Observable<Animal> {
    return this.http.get<Animal>(`${this.base}/animals/${id}`);
  }
}
