import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Register } from './register';
import { ProfileService } from '../../Services/Profile/ProfileService';
import { of, throwError } from 'rxjs';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

const mockProfileService = { create: vi.fn(), update: vi.fn(), delete: vi.fn() };

describe('Register Component', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [
        provideNoopAnimations(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ProfileService, useValue: mockProfileService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form initially', () => {
    expect(component.registerForm.invalid).toBe(true);
  });

  it('should not submit if form is invalid', () => {
    component.onSubmit();
    expect(mockProfileService.create).not.toHaveBeenCalled();
  });

  it('should call create on valid submit', () => {
    mockProfileService.create.mockReturnValue(of({}));
    component.registerForm.setValue({
      name: 'Test User', email: 'test@test.com', mobile: '9876543210',
      role: 'Admin', password: 'password123', confirmPassword: 'password123',
    });
    component.onSubmit();
    expect(mockProfileService.create).toHaveBeenCalled();
  });

  it('should set errorMsg on create failure', () => {
    mockProfileService.create.mockReturnValue(throwError(() => ({ error: { message: 'Email exists' } })));
    component.registerForm.setValue({
      name: 'Test User', email: 'test@test.com', mobile: '9876543210',
      role: 'Admin', password: 'password123', confirmPassword: 'password123',
    });
    component.onSubmit();
    expect(component.errorMsg).toBe('Email exists');
  });

  it('should fail passwordMatch validation', () => {
    component.registerForm.setValue({
      name: 'Test User', email: 'test@test.com', mobile: '9876543210',
      role: 'Admin', password: 'password123', confirmPassword: 'different',
    });
    expect(component.registerForm.hasError('passwordMismatch')).toBe(true);
  });

  it('should toggle password visibility', () => {
    expect(component.hidePassword()).toBe(true);
    component.hidePassword.set(false);
    expect(component.hidePassword()).toBe(false);
  });
});
