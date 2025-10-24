import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Breed, BreedImage, ApiResponse } from '../models/breed.model';

@Injectable({
  providedIn: 'root'
})
export class BreedService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getAllBreeds(): Observable<ApiResponse<Breed[]>> {
    return this.http.get<ApiResponse<Breed[]>>(`${this.apiUrl}/breeds`);
  }

  getBreedById(id: string): Observable<ApiResponse<Breed>> {
    return this.http.get<ApiResponse<Breed>>(`${this.apiUrl}/breeds/${id}`);
  }

  searchBreeds(query: string): Observable<ApiResponse<Breed[]>> {
    return this.http.get<ApiResponse<Breed[]>>(`${this.apiUrl}/breeds/search?q=${query}`);
  }

  getImagesByBreedId(breedId: string, limit: number = 10): Observable<ApiResponse<BreedImage[]>> {
    return this.http.get<ApiResponse<BreedImage[]>>(`${this.apiUrl}/images/breed/${breedId}?limit=${limit}`);
  }
}
