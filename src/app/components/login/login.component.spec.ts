import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { ApiResponse } from '../../models/breed.model';
import { AuthResponse } from '../../models/user.model';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: jest.Mocked<AuthService>;
  let mockRouter: jest.Mocked<Router>;

  beforeEach(async () => {
    mockAuthService = {
      login: jest.fn(),
    } as any;

    mockRouter = {
      navigate: jest.fn(),
    } as any;

    await TestBed.configureTestingModule({
      imports: [],
      declarations: [],
      providers: [
        LoginComponent,
        FormBuilder,
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    const formBuilder = TestBed.inject(FormBuilder);
    component = new LoginComponent(formBuilder, mockAuthService, mockRouter);
    component.ngOnInit();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize login form with empty values', () => {
      expect(component.loginForm).toBeDefined();
      expect(component.loginForm.get('email')?.value).toBe('');
      expect(component.loginForm.get('password')?.value).toBe('');
    });

    it('should have email field with required and email validators', () => {
      const emailControl = component.loginForm.get('email');
      expect(emailControl?.hasError('required')).toBe(true);

      emailControl?.setValue('invalid-email');
      expect(emailControl?.hasError('email')).toBe(true);

      emailControl?.setValue('valid@email.com');
      expect(emailControl?.hasError('email')).toBe(false);
    });

    it('should have password field with required and minLength validators', () => {
      const passwordControl = component.loginForm.get('password');
      expect(passwordControl?.hasError('required')).toBe(true);

      passwordControl?.setValue('12345');
      expect(passwordControl?.hasError('minlength')).toBe(true);

      passwordControl?.setValue('123456');
      expect(passwordControl?.hasError('minlength')).toBe(false);
    });
  });

  describe('Form Validation', () => {
    it('should mark form as invalid when empty', () => {
      expect(component.loginForm.valid).toBe(false);
    });

    it('should mark form as valid with correct data', () => {
      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(component.loginForm.valid).toBe(true);
    });

    it('should not submit when form is invalid', () => {
      component.onSubmit();
      expect(mockAuthService.login).not.toHaveBeenCalled();
    });

    it('should mark all fields as touched when submitting invalid form', () => {
      component.onSubmit();
      expect(component.loginForm.get('email')?.touched).toBe(true);
      expect(component.loginForm.get('password')?.touched).toBe(true);
    });
  });

  describe('Login Submission', () => {
    it('should call authService.login with correct credentials', () => {
      const mockResponse: ApiResponse<AuthResponse> = {
        success: true,
        data: {
          user: {
            _id: 'user123',
            email: 'test@example.com',
            name: 'Test User',
            createdAt: new Date(),
          },
          token: 'mock-token',
        },
      };

      mockAuthService.login.mockReturnValue(of(mockResponse));

      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'password123',
      });

      component.onSubmit();

      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should navigate to /breeds on successful login', () => {
      const mockResponse: ApiResponse<AuthResponse> = {
        success: true,
        data: {
          user: {
            _id: 'user123',
            email: 'test@example.com',
            name: 'Test User',
            createdAt: new Date(),
          },
          token: 'mock-token',
        },
      };

      mockAuthService.login.mockReturnValue(of(mockResponse));

      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'password123',
      });

      component.onSubmit();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/breeds']);
    });

    it('should set loading to true during login', () => {
      const mockResponse: ApiResponse<AuthResponse> = {
        success: true,
        data: {
          user: {
            _id: 'user123',
            email: 'test@example.com',
            name: 'Test User',
            createdAt: new Date(),
          },
          token: 'mock-token',
        },
      };

      mockAuthService.login.mockReturnValue(of(mockResponse));

      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(component.loading).toBe(false);
      component.onSubmit();
      expect(component.loading).toBe(true);
    });

    it('should display error message on failed login', () => {
      const mockError = {
        error: {
          error: 'Invalid credentials',
        },
      };

      mockAuthService.login.mockReturnValue(throwError(() => mockError));

      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      component.onSubmit();

      expect(component.errorMessage).toBe('Invalid credentials');
      expect(component.loading).toBe(false);
    });

    it('should display generic error message when error has no message', () => {
      mockAuthService.login.mockReturnValue(throwError(() => ({})));

      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'password123',
      });

      component.onSubmit();

      expect(component.errorMessage).toBe('An error occurred during login');
      expect(component.loading).toBe(false);
    });

    it('should handle unsuccessful response', () => {
      const mockResponse: ApiResponse<AuthResponse> = {
        success: false,
        error: 'Login failed',
      };

      mockAuthService.login.mockReturnValue(of(mockResponse));

      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'password123',
      });

      component.onSubmit();

      expect(component.errorMessage).toBe('Login failed');
      expect(component.loading).toBe(false);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should clear error message on new submission', () => {
      component.errorMessage = 'Previous error';

      const mockResponse: ApiResponse<AuthResponse> = {
        success: true,
        data: {
          user: {
            _id: 'user123',
            email: 'test@example.com',
            name: 'Test User',
            createdAt: new Date(),
          },
          token: 'mock-token',
        },
      };

      mockAuthService.login.mockReturnValue(of(mockResponse));

      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'password123',
      });

      component.onSubmit();

      expect(component.errorMessage).toBe('');
    });
  });
});
