import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BreedService } from '../../services/breed.service';
import { Breed } from '../../models/breed.model';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-breed-search',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, InputTextModule],
  templateUrl: './breed-search.component.html',
  styleUrl: './breed-search.component.scss'
})
export class BreedSearchComponent {
  searchQuery = '';
  searchResults: Breed[] = [];
  loading = false;
  errorMessage = '';
  hasSearched = false;

  constructor(private breedService: BreedService) {}

  onSearch(): void {
    if (!this.searchQuery.trim()) {
      this.errorMessage = 'Please enter a search term';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.hasSearched = true;

    this.breedService.searchBreeds(this.searchQuery.trim()).subscribe({
      next: (response) => {
        if (response.success) {
          this.searchResults = response.data;
          if (this.searchResults.length === 0) {
            this.errorMessage = 'No breeds found matching your search';
          }
        } else {
          this.errorMessage = 'Search failed';
        }
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.error || 'An error occurred during search';
        this.loading = false;
      }
    });
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchResults = [];
    this.errorMessage = '';
    this.hasSearched = false;
  }
}
