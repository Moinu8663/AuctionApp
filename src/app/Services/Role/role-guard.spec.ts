import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { roleGuard } from './role-guard';
import { Login } from '../Login/login';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MatSnackBar } from '@angular/material/snack-bar';

const mockLoginService = { getRole: vi.fn(), isLoggedIn: vi.fn(), checkSession: vi.fn(), logout: vi.fn() };
const mockSnackBar = { open: vi.fn() };

const executeGuard: CanActivateFn = (...guardParameters) =>
  TestBed.runInInjectionContext(() => roleGuard(...guardParameters));

function createRoute(roles: string[]): ActivatedRouteSnapshot {
  const route = new ActivatedRouteSnapshot();
  (route as any).data = { roles };
  return route;
}

const mockState = {} as RouterStateSnapshot;

describe('roleGuard', () => {
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: '**', redirectTo: '' }
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

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should allow access when user role matches required role', () => {
    mockLoginService.getRole.mockReturnValue('Admin');
    const result = executeGuard(createRoute(['Admin']), mockState);
    expect(result).toBe(true);
  });

  it('should allow access when user role is one of multiple allowed roles', () => {
    mockLoginService.getRole.mockReturnValue('SuperAdmin');
    const result = executeGuard(createRoute(['SuperAdmin', 'Admin']), mockState);
    expect(result).toBe(true);
  });

  it('should deny access when user role does not match required role', () => {
    mockLoginService.getRole.mockReturnValue('User');
    const result = executeGuard(createRoute(['Admin']), mockState);
    expect(result).toBe(false);
  });

  it('should deny access when user role is null', () => {
    mockLoginService.getRole.mockReturnValue(null);
    const result = executeGuard(createRoute(['Admin']), mockState);
    expect(result).toBe(false);
  });

  it('should deny access when user role is empty string', () => {
    mockLoginService.getRole.mockReturnValue('');
    const result = executeGuard(createRoute(['Admin']), mockState);
    expect(result).toBe(false);
  });

  it('should navigate to /login when access is denied', () => {
    const spy = vi.spyOn(router, 'navigate');
    mockLoginService.getRole.mockReturnValue('User');
    executeGuard(createRoute(['SuperAdmin']), mockState);
    expect(spy).toHaveBeenCalledWith(['/login']);
  });

  it('should not navigate when access is granted', () => {
    const spy = vi.spyOn(router, 'navigate');
    mockLoginService.getRole.mockReturnValue('Admin');
    executeGuard(createRoute(['Admin']), mockState);
    expect(spy).not.toHaveBeenCalled();
  });

  it('should allow SuperAdmin access to SuperAdmin-only route', () => {
    mockLoginService.getRole.mockReturnValue('SuperAdmin');
    const result = executeGuard(createRoute(['SuperAdmin']), mockState);
    expect(result).toBe(true);
  });

  it('should deny Admin access to SuperAdmin-only route', () => {
    mockLoginService.getRole.mockReturnValue('Admin');
    const result = executeGuard(createRoute(['SuperAdmin']), mockState);
    expect(result).toBe(false);
  });

  it('should allow User access to User-only route', () => {
    mockLoginService.getRole.mockReturnValue('User');
    const result = executeGuard(createRoute(['User']), mockState);
    expect(result).toBe(true);
  });

  it('should allow access when all roles are permitted', () => {
    mockLoginService.getRole.mockReturnValue('User');
    const result = executeGuard(createRoute(['SuperAdmin', 'Admin', 'User']), mockState);
    expect(result).toBe(true);
  });

  it('should deny access when roles array is empty', () => {
    mockLoginService.getRole.mockReturnValue('Admin');
    const result = executeGuard(createRoute([]), mockState);
    expect(result).toBe(false);
  });
});
