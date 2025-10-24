import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BreedService } from './breed.service';
import { environment } from '../../environments/environment';
import { Breed, BreedImage, ApiResponse } from '../models/breed.model';

describe('BreedService', () => {
  let service: BreedService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BreedService]
    });
    service = TestBed.inject(BreedService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllBreeds', () => {
    it('should return all breeds', () => {
      const mockBreeds: Breed[] = [
        {
          id: 'abys',
          name: 'Abyssinian',
          origin: 'Egypt',
          temperament: 'Active, Energetic',
          description: 'The Abyssinian is easy to care for.',
          life_span: '14 - 15',
          weight: { imperial: '7 - 10', metric: '3 - 5' }
        },
        {
          id: 'aege',
          name: 'Aegean',
          origin: 'Greece',
          temperament: 'Affectionate, Social',
          description: 'Native to the Greek islands.',
          life_span: '9 - 12',
          weight: { imperial: '7 - 10', metric: '3 - 5' }
        }
      ];

      const mockResponse: ApiResponse<Breed[]> = {
        success: true,
        data: mockBreeds,
        count: 2
      };

      service.getAllBreeds().subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.data).toEqual(mockBreeds);
        expect(response.count).toBe(2);
      });

      const req = httpMock.expectOne(`${apiUrl}/breeds`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle error when fetching breeds fails', () => {
      const errorMessage = 'Network error';

      service.getAllBreeds().subscribe({
        next: () => fail('should have failed with error'),
        error: (error) => {
          expect(error.status).toBe(500);
          expect(error.statusText).toBe('Server Error');
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/breeds`);
      req.flush(errorMessage, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('getBreedById', () => {
    it('should return a specific breed by ID', () => {
      const mockBreed: Breed = {
        id: 'abys',
        name: 'Abyssinian',
        origin: 'Egypt',
        temperament: 'Active, Energetic',
        description: 'The Abyssinian is easy to care for.',
        life_span: '14 - 15',
        weight: { imperial: '7 - 10', metric: '3 - 5' }
      };

      const mockResponse: ApiResponse<Breed> = {
        success: true,
        data: mockBreed
      };

      service.getBreedById('abys').subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.data).toEqual(mockBreed);
        expect(response.data?.id).toBe('abys');
      });

      const req = httpMock.expectOne(`${apiUrl}/breeds/abys`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle error when breed not found', () => {
      service.getBreedById('invalid').subscribe({
        next: () => fail('should have failed with error'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/breeds/invalid`);
      req.flush('Breed not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('searchBreeds', () => {
    it('should search breeds by query', () => {
      const mockBreeds: Breed[] = [
        {
          id: 'beng',
          name: 'Bengal',
          origin: 'United States',
          temperament: 'Alert, Agile',
          description: 'Bengals are a lot of fun to live with.',
          life_span: '12 - 15',
          weight: { imperial: '6 - 12', metric: '3 - 7' }
        }
      ];

      const mockResponse: ApiResponse<Breed[]> = {
        success: true,
        data: mockBreeds,
        count: 1
      };

      service.searchBreeds('Bengal').subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.data).toEqual(mockBreeds);
        expect(response.data?.length).toBe(1);
      });

      const req = httpMock.expectOne(`${apiUrl}/breeds/search?q=Bengal`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return empty array when no breeds match', () => {
      const mockResponse: ApiResponse<Breed[]> = {
        success: true,
        data: [],
        count: 0
      };

      service.searchBreeds('nonexistent').subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.data).toEqual([]);
        expect(response.count).toBe(0);
      });

      const req = httpMock.expectOne(`${apiUrl}/breeds/search?q=nonexistent`);
      req.flush(mockResponse);
    });
  });

  describe('getImagesByBreedId', () => {
    it('should return images for a specific breed', () => {
      const mockImages: BreedImage[] = [
        {
          id: 'img1',
          url: 'https://example.com/cat1.jpg',
          width: 1200,
          height: 800
        },
        {
          id: 'img2',
          url: 'https://example.com/cat2.jpg',
          width: 1200,
          height: 800
        }
      ];

      const mockResponse: ApiResponse<BreedImage[]> = {
        success: true,
        data: mockImages,
        count: 2
      };

      service.getImagesByBreedId('abys', 10).subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.data).toEqual(mockImages);
        expect(response.data?.length).toBe(2);
      });

      const req = httpMock.expectOne(`${apiUrl}/images/breed/abys?limit=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should use default limit of 10 if not provided', () => {
      const mockResponse: ApiResponse<BreedImage[]> = {
        success: true,
        data: [],
        count: 0
      };

      service.getImagesByBreedId('abys').subscribe();

      const req = httpMock.expectOne(`${apiUrl}/images/breed/abys?limit=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle custom limit parameter', () => {
      const mockResponse: ApiResponse<BreedImage[]> = {
        success: true,
        data: [],
        count: 0
      };

      service.getImagesByBreedId('abys', 5).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/images/breed/abys?limit=5`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });
});
