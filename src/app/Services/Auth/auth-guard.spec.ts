import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { authGuard } from './auth-guard';
import { Login } from '../Login/login';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Component } from '@angular/core';

const mockLoginService = { isLoggedIn: vi.fn(), getRole: vi.fn(), checkSession: vi.fn(), logout: vi.fn() };
const mockSnackBar = { open: vi.fn() };

@Component({ standalone: true, template: '' })
class DummyComponent {}

const executeGuard: CanActivateFn = (...guardParameters) =>
  TestBed.runInInjectionContext(() => authGuard(...guardParameters));

const mockRoute = new ActivatedRouteSnapshot();
const mockState = {} as RouterStateSnapshot;

describe('authGuard', () => {
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'login', component: DummyComponent },
          { path: 'home',  component: DummyComponent },
        ]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        { provide: Login,       useValue: mockLoginService },
        { provide: MatSnackBar, useValue: mockSnackBar },
      ],
    });
    router = TestBed.inject(Router);
  });

  afterEach(() => vi.clearAllMocks());

  // ===== CREATION =====
  it('should be created', () => expect(executeGuard).toBeTruthy());

  // ===== LOGGED IN =====
  it('should allow access when user is logged in', () => {
    mockLoginService.isLoggedIn.mockReturnValue(true);
    const result = executeGuard(mockRoute, mockState);
    expect(result).toBe(true);
  });

  it('should not navigate when user is logged in', () => {
    const spy = vi.spyOn(router, 'navigate');
    mockLoginService.isLoggedIn.mockReturnValue(true);
    executeGuard(mockRoute, mockState);
    expect(spy).not.toHaveBeenCalled();
  });

  // ===== NOT LOGGED IN =====
  it('should deny access when user is not logged in', () => {
    mockLoginService.isLoggedIn.mockReturnValue(false);
    const result = executeGuard(mockRoute, mockState);
    expect(result).toBe(false);
  });

  it('should navigate to /login when user is not logged in', () => {
    const spy = vi.spyOn(router, 'navigate');
    mockLoginService.isLoggedIn.mockReturnValue(false);
    executeGuard(mockRoute, mockState);
    expect(spy).toHaveBeenCalledWith(['/login']);
  });

  // ===== SESSION STATES =====
  it('should deny access when token is missing from sessionStorage', () => {
    sessionStorage.clear();
    mockLoginService.isLoggedIn.mockReturnValue(false);
    const result = executeGuard(mockRoute, mockState);
    expect(result).toBe(false);
  });

  it('should allow access when token exists in sessionStorage', () => {
    sessionStorage.setItem('token', 'valid-token');
    mockLoginService.isLoggedIn.mockReturnValue(true);
    const result = executeGuard(mockRoute, mockState);
    expect(result).toBe(true);
    sessionStorage.clear();
  });

  it('should call isLoggedIn exactly once per guard execution', () => {
    mockLoginService.isLoggedIn.mockReturnValue(true);
    executeGuard(mockRoute, mockState);
    expect(mockLoginService.isLoggedIn).toHaveBeenCalledTimes(1);
  });

  it('should navigate to /login only once when denied', () => {
    const spy = vi.spyOn(router, 'navigate');
    mockLoginService.isLoggedIn.mockReturnValue(false);
    executeGuard(mockRoute, mockState);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(['/login']);
  });
});
