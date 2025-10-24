import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { BreedsListComponent } from './breeds-list.component';
import { BreedService } from '../../services/breed.service';
import { Breed, BreedImage, ApiResponse } from '../../models/breed.model';

describe('BreedsListComponent', () => {
  let component: BreedsListComponent;
  let fixture: ComponentFixture<BreedsListComponent>;
  let mockBreedService: jest.Mocked<BreedService>;

  const mockBreeds: Breed[] = [
    {
      id: 'abys',
      name: 'Abyssinian',
      origin: 'Egypt',
      temperament: 'Active, Energetic',
      description: 'The Abyssinian is easy to care for.',
      life_span: '14 - 15',
      weight: { imperial: '7 - 10', metric: '3 - 5' },
    },
    {
      id: 'aege',
      name: 'Aegean',
      origin: 'Greece',
      temperament: 'Affectionate, Social',
      description: 'Native to the Greek islands.',
      life_span: '9 - 12',
      weight: { imperial: '7 - 10', metric: '3 - 5' },
    },
  ];

  const mockImages: BreedImage[] = [
    {
      id: 'img1',
      url: 'https://example.com/cat1.jpg',
      width: 1200,
      height: 800,
    },
    {
      id: 'img2',
      url: 'https://example.com/cat2.jpg',
      width: 1200,
      height: 800,
    },
    {
      id: 'img3',
      url: 'https://example.com/cat3.jpg',
      width: 1200,
      height: 800,
    },
  ];

  beforeEach(async () => {
    mockBreedService = {
      getAllBreeds: jest.fn(),
      getImagesByBreedId: jest.fn(),
    } as any;

    await TestBed.configureTestingModule({
      imports: [BreedsListComponent],
      providers: [{ provide: BreedService, useValue: mockBreedService }],
    }).compileComponents();

    fixture = TestBed.createComponent(BreedsListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with default values', () => {
      expect(component.breeds).toEqual([]);
      expect(component.selectedBreed).toBeNull();
      expect(component.breedImages).toEqual([]);
      expect(component.currentImageIndex).toBe(0);
      expect(component.loading).toBe(false);
      expect(component.loadingImages).toBe(false);
      expect(component.errorMessage).toBe('');
    });

    it('should call loadBreeds on init', () => {
      const mockResponse: ApiResponse<Breed[]> = {
        success: true,
        data: mockBreeds,
        count: 2,
      };

      mockBreedService.getAllBreeds.mockReturnValue(of(mockResponse));

      fixture.detectChanges(); // This triggers ngOnInit

      expect(mockBreedService.getAllBreeds).toHaveBeenCalled();
      expect(component.breeds).toEqual(mockBreeds);
    });
  });

  describe('loadBreeds', () => {
    it('should load breeds successfully', () => {
      const mockResponse: ApiResponse<Breed[]> = {
        success: true,
        data: mockBreeds,
        count: 2,
      };

      mockBreedService.getAllBreeds.mockReturnValue(of(mockResponse));

      component.loadBreeds();

      expect(component.loading).toBe(false);
      expect(component.breeds).toEqual(mockBreeds);
      expect(component.errorMessage).toBe('');
    });

    it('should set loading to true during fetch', () => {
      const mockResponse: ApiResponse<Breed[]> = {
        success: true,
        data: mockBreeds,
        count: 2,
      };

      mockBreedService.getAllBreeds.mockReturnValue(of(mockResponse));

      expect(component.loading).toBe(false);
      component.loadBreeds();
      expect(component.loading).toBe(false); // Synchronous in test
    });

    it('should handle error when loading breeds', () => {
      const mockError = {
        error: {
          error: 'Network error',
        },
      };

      mockBreedService.getAllBreeds.mockReturnValue(throwError(() => mockError));

      component.loadBreeds();

      expect(component.errorMessage).toBe('Network error');
      expect(component.loading).toBe(false);
    });

    it('should handle generic error when no error message', () => {
      mockBreedService.getAllBreeds.mockReturnValue(throwError(() => ({})));

      component.loadBreeds();

      expect(component.errorMessage).toBe('An error occurred while loading breeds');
      expect(component.loading).toBe(false);
    });

    it('should handle unsuccessful response', () => {
      const mockResponse: ApiResponse<Breed[]> = {
        success: false,
        error: 'Failed to fetch',
      };

      mockBreedService.getAllBreeds.mockReturnValue(of(mockResponse));

      component.loadBreeds();

      expect(component.errorMessage).toBe('Failed to load breeds');
      expect(component.loading).toBe(false);
    });
  });

  describe('onBreedSelect', () => {
    beforeEach(() => {
      component.breeds = mockBreeds;
    });

    it('should select breed and load images', () => {
      const mockResponse: ApiResponse<BreedImage[]> = {
        success: true,
        data: mockImages,
        count: 3,
      };

      mockBreedService.getImagesByBreedId.mockReturnValue(of(mockResponse));

      const event = {
        target: { value: 'abys' },
      } as any;

      component.onBreedSelect(event);

      expect(component.selectedBreed).toEqual(mockBreeds[0]);
      expect(mockBreedService.getImagesByBreedId).toHaveBeenCalledWith('abys', 10);
    });

    it('should clear selection when no breed selected', () => {
      component.selectedBreed = mockBreeds[0];
      component.breedImages = mockImages;
      component.currentImageIndex = 2;

      const event = {
        target: { value: '' },
      } as any;

      component.onBreedSelect(event);

      expect(component.selectedBreed).toBeNull();
      expect(component.breedImages).toEqual([]);
      expect(component.currentImageIndex).toBe(0);
    });

    it('should handle invalid breed id', () => {
      const event = {
        target: { value: 'invalid-id' },
      } as any;

      component.onBreedSelect(event);

      expect(component.selectedBreed).toBeNull();
      expect(mockBreedService.getImagesByBreedId).not.toHaveBeenCalled();
    });
  });

  describe('loadBreedImages', () => {
    it('should load images successfully', () => {
      const mockResponse: ApiResponse<BreedImage[]> = {
        success: true,
        data: mockImages,
        count: 3,
      };

      mockBreedService.getImagesByBreedId.mockReturnValue(of(mockResponse));

      component.loadBreedImages('abys');

      expect(component.breedImages).toEqual(mockImages);
      expect(component.loadingImages).toBe(false);
      expect(component.currentImageIndex).toBe(0);
    });

    it('should reset images before loading', () => {
      component.breedImages = mockImages;
      component.currentImageIndex = 2;

      const mockResponse: ApiResponse<BreedImage[]> = {
        success: true,
        data: [],
        count: 0,
      };

      mockBreedService.getImagesByBreedId.mockReturnValue(of(mockResponse));

      component.loadBreedImages('abys');

      expect(component.currentImageIndex).toBe(0);
    });

    it('should handle error when loading images', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      mockBreedService.getImagesByBreedId.mockReturnValue(
        throwError(() => new Error('Image load error'))
      );

      component.loadBreedImages('abys');

      expect(component.loadingImages).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('Image Navigation', () => {
    beforeEach(() => {
      component.breedImages = mockImages;
      component.currentImageIndex = 0;
    });

    it('should navigate to next image', () => {
      expect(component.currentImageIndex).toBe(0);

      component.nextImage();
      expect(component.currentImageIndex).toBe(1);

      component.nextImage();
      expect(component.currentImageIndex).toBe(2);
    });

    it('should wrap to first image after last image', () => {
      component.currentImageIndex = 2;

      component.nextImage();

      expect(component.currentImageIndex).toBe(0);
    });

    it('should navigate to previous image', () => {
      component.currentImageIndex = 2;

      component.previousImage();
      expect(component.currentImageIndex).toBe(1);

      component.previousImage();
      expect(component.currentImageIndex).toBe(0);
    });

    it('should wrap to last image from first image', () => {
      component.currentImageIndex = 0;

      component.previousImage();

      expect(component.currentImageIndex).toBe(2);
    });

    it('should not navigate when no images', () => {
      component.breedImages = [];
      component.currentImageIndex = 0;

      component.nextImage();
      expect(component.currentImageIndex).toBe(0);

      component.previousImage();
      expect(component.currentImageIndex).toBe(0);
    });
  });

  describe('currentImage getter', () => {
    it('should return current image', () => {
      component.breedImages = mockImages;
      component.currentImageIndex = 1;

      expect(component.currentImage).toEqual(mockImages[1]);
    });

    it('should return null when no images', () => {
      component.breedImages = [];

      expect(component.currentImage).toBeNull();
    });

    it('should return correct image after navigation', () => {
      component.breedImages = mockImages;
      component.currentImageIndex = 0;

      expect(component.currentImage).toEqual(mockImages[0]);

      component.nextImage();
      expect(component.currentImage).toEqual(mockImages[1]);

      component.nextImage();
      expect(component.currentImage).toEqual(mockImages[2]);
    });
  });
});
