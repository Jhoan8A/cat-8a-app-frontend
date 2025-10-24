import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../models/user.model';
import { ApiResponse } from '../models/breed.model';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiUrl;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('constructor', () => {
    it('should initialize with null user when localStorage is empty', () => {
      expect(service.currentUserValue).toBeNull();
    });

    it('should initialize with user from localStorage if exists', () => {
      const mockDate = new Date().toISOString();
      const mockUser: User = {
        _id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: mockDate as any
      };

      localStorage.setItem('currentUser', JSON.stringify(mockUser));

      // Create new instance to test constructor
      const newService = new AuthService(TestBed.inject(HttpClientTestingModule) as any);

      expect(newService.currentUserValue).toEqual(mockUser);
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', () => {
      const loginData: LoginRequest = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockUser: User = {
        _id: 'user123',
        email: loginData.email,
        name: 'Test User',
        createdAt: new Date()
      };

      const mockAuthResponse: AuthResponse = {
        user: mockUser,
        token: 'mock-jwt-token'
      };

      const mockResponse: ApiResponse<AuthResponse> = {
        success: true,
        data: mockAuthResponse
      };

      service.login(loginData).subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.data?.user).toEqual(mockUser);
        expect(response.data?.token).toBe('mock-jwt-token');
        expect(service.currentUserValue).toEqual(mockUser);
        expect(localStorage.getItem('token')).toBe('mock-jwt-token');
        expect(localStorage.getItem('currentUser')).toBe(JSON.stringify(mockUser));
      });

      const req = httpMock.expectOne(`${apiUrl}/users/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(loginData);
      req.flush(mockResponse);
    });

    it('should handle login error', () => {
      const loginData: LoginRequest = {
        email: 'wrong@example.com',
        password: 'wrongpassword'
      };

      service.login(loginData).subscribe({
        next: () => fail('should have failed with error'),
        error: (error) => {
          expect(error.status).toBe(401);
          expect(service.currentUserValue).toBeNull();
          expect(localStorage.getItem('token')).toBeNull();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/users/login`);
      req.flush('Invalid credentials', { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('register', () => {
    it('should register a new user successfully', () => {
      const registerData: RegisterRequest = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User'
      };

      const mockUser: User = {
        _id: 'user456',
        email: registerData.email,
        name: registerData.name,
        createdAt: new Date()
      };

      const mockAuthResponse: AuthResponse = {
        user: mockUser,
        token: 'new-jwt-token'
      };

      const mockResponse: ApiResponse<AuthResponse> = {
        success: true,
        data: mockAuthResponse
      };

      service.register(registerData).subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.data?.user).toEqual(mockUser);
        expect(response.data?.token).toBe('new-jwt-token');
        expect(service.currentUserValue).toEqual(mockUser);
        expect(localStorage.getItem('token')).toBe('new-jwt-token');
        expect(localStorage.getItem('currentUser')).toBe(JSON.stringify(mockUser));
      });

      const req = httpMock.expectOne(`${apiUrl}/users/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(registerData);
      req.flush(mockResponse);
    });

    it('should handle registration error when user exists', () => {
      const registerData: RegisterRequest = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Existing User'
      };

      service.register(registerData).subscribe({
        next: () => fail('should have failed with error'),
        error: (error) => {
          expect(error.status).toBe(409);
          expect(service.currentUserValue).toBeNull();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/users/register`);
      req.flush('User already exists', { status: 409, statusText: 'Conflict' });
    });
  });

  describe('logout', () => {
    it('should clear user data and localStorage', () => {
      const mockUser: User = {
        _id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date()
      };

      localStorage.setItem('currentUser', JSON.stringify(mockUser));
      localStorage.setItem('token', 'mock-token');

      service.logout();

      expect(service.currentUserValue).toBeNull();
      expect(localStorage.getItem('currentUser')).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('getToken', () => {
    it('should return token from localStorage', () => {
      const token = 'test-token';
      localStorage.setItem('token', token);

      expect(service.getToken()).toBe(token);
    });

    it('should return null when no token exists', () => {
      expect(service.getToken()).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      localStorage.setItem('token', 'test-token');

      expect(service.isAuthenticated()).toBe(true);
    });

    it('should return false when no token exists', () => {
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('getProfile', () => {
    it('should fetch user profile', () => {
      const mockUser: User = {
        _id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date()
      };

      const mockResponse: ApiResponse<User> = {
        success: true,
        data: mockUser
      };

      service.getProfile().subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.data).toEqual(mockUser);
      });

      const req = httpMock.expectOne(`${apiUrl}/users/me`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle error when fetching profile', () => {
      service.getProfile().subscribe({
        next: () => fail('should have failed with error'),
        error: (error) => {
          expect(error.status).toBe(401);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/users/me`);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('currentUser observable', () => {
    it('should emit current user changes', (done) => {
      const mockUser: User = {
        _id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date()
      };

      const mockAuthResponse: AuthResponse = {
        user: mockUser,
        token: 'mock-token'
      };

      const mockResponse: ApiResponse<AuthResponse> = {
        success: true,
        data: mockAuthResponse
      };

      service.currentUser.subscribe(user => {
        if (user) {
          expect(user).toEqual(mockUser);
          done();
        }
      });

      service.login({ email: 'test@example.com', password: 'pass' }).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/users/login`);
      req.flush(mockResponse);
    });
  });
});
