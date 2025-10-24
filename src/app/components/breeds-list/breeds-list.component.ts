import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BreedService } from '../../services/breed.service';
import { Breed, BreedImage } from '../../models/breed.model';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-breeds-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, CardModule],
  templateUrl: './breeds-list.component.html',
  styleUrl: './breeds-list.component.scss'
})
export class BreedsListComponent implements OnInit {
  breeds: Breed[] = [];
  selectedBreed: Breed | null = null;
  breedImages: BreedImage[] = [];
  currentImageIndex = 0;
  loading = false;
  loadingImages = false;
  errorMessage = '';

  constructor(private breedService: BreedService) {}

  ngOnInit(): void {
    this.loadBreeds();
  }

  loadBreeds(): void {
    this.loading = true;
    this.errorMessage = '';

    this.breedService.getAllBreeds().subscribe({
      next: (response) => {
        if (response.success) {
          this.breeds = response.data;
        } else {
          this.errorMessage = 'Failed to load breeds';
        }
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.error || 'An error occurred while loading breeds';
        this.loading = false;
      }
    });
  }

  onBreedSelect(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const breedId = selectElement.value;

    if (!breedId) {
      this.selectedBreed = null;
      this.breedImages = [];
      this.currentImageIndex = 0;
      return;
    }

    const breed = this.breeds.find(b => b.id === breedId);
    if (breed) {
      this.selectedBreed = breed;
      this.loadBreedImages(breedId);
    }
  }

  loadBreedImages(breedId: string): void {
    this.loadingImages = true;
    this.breedImages = [];
    this.currentImageIndex = 0;

    this.breedService.getImagesByBreedId(breedId, 10).subscribe({
      next: (response) => {
        if (response.success) {
          this.breedImages = response.data;
        }
        this.loadingImages = false;
      },
      error: (error) => {
        console.error('Error loading images:', error);
        this.loadingImages = false;
      }
    });
  }

  previousImage(): void {
    if (this.breedImages.length > 0) {
      this.currentImageIndex = (this.currentImageIndex - 1 + this.breedImages.length) % this.breedImages.length;
    }
  }

  nextImage(): void {
    if (this.breedImages.length > 0) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.breedImages.length;
    }
  }

  get currentImage(): BreedImage | null {
    return this.breedImages.length > 0 ? this.breedImages[this.currentImageIndex] : null;
  }
}
