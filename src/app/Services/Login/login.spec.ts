import { TestBed } from '@angular/core/testing';
import { Login } from './login';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { environment } from '../../environments/environment';

const mockSnackBar = { open: vi.fn() };

// Minimal JWT with exp = far future (year 2099)
// Header: {"alg":"HS256","typ":"JWT"}
// Payload: {"sub":"test","exp":4102444800}
const MOCK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0IiwiZXhwIjo0MTAyNDQ0ODAwfQ.abc';

@Component({ standalone: true, template: '' })
class DummyComponent {}

describe('Login Service', () => {
  let service: Login;
  let httpMock: HttpTestingController;
  let router: Router;
  const base = environment.apiBaseUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        Login,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'login', component: DummyComponent },
          { path: 'home',  component: DummyComponent },
        ]),
        provideNoopAnimations(),
        { provide: MatSnackBar, useValue: mockSnackBar },
      ],
    });
    service  = TestBed.inject(Login);
    httpMock = TestBed.inject(HttpTestingController);
    router   = TestBed.inject(Router);
    sessionStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    vi.clearAllMocks();
    sessionStorage.clear();
    service.clearLogoutTimer();
  });

  // ===== CREATION =====
  it('should be created', () => expect(service).toBeTruthy());

  // ===== isLoggedIn =====
  it('should return false for isLoggedIn when no token', () => {
    expect(service.isLoggedIn()).toBe(false);
  });

  it('should return true for isLoggedIn when token exists', () => {
    sessionStorage.setItem('token', 'abc');
    expect(service.isLoggedIn()).toBe(true);
  });

  // ===== getRole =====
  it('should return null for getRole when not logged in', () => {
    expect(service.getRole()).toBeNull();
  });

  it('should return role from sessionStorage', () => {
    sessionStorage.setItem('role', 'Admin');
    expect(service.getRole()).toBe('Admin');
  });

  it('should return SuperAdmin role correctly', () => {
    sessionStorage.setItem('role', 'SuperAdmin');
    expect(service.getRole()).toBe('SuperAdmin');
  });

  // ===== logout =====
  it('should clear sessionStorage on logout', () => {
    sessionStorage.setItem('token', 'abc');
    sessionStorage.setItem('email', 'test@test.com');
    sessionStorage.setItem('role', 'Admin');
    service.logout();
    expect(sessionStorage.getItem('token')).toBeNull();
    expect(sessionStorage.getItem('email')).toBeNull();
    expect(sessionStorage.getItem('role')).toBeNull();
  });

  it('should navigate to /login on logout', () => {
    const spy = vi.spyOn(router, 'navigate');
    service.logout();
    expect(spy).toHaveBeenCalledWith(['/login']);
  });

  // ===== startLogoutTimer =====
  it('should call logout immediately when duration is 0', () => {
    const spy = vi.spyOn(service, 'logout');
    service.startLogoutTimer(0);
    expect(spy).toHaveBeenCalled();
  });

  it('should call logout immediately when duration is negative', () => {
    const spy = vi.spyOn(service, 'logout');
    service.startLogoutTimer(-1000);
    expect(spy).toHaveBeenCalled();
  });

  it('should set timer and show snackbar after duration', () => {
    vi.useFakeTimers();
    service.startLogoutTimer(3000);
    vi.advanceTimersByTime(3000);
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Session expired. Please login again.', 'OK',
      expect.objectContaining({ duration: 5000 })
    );
    vi.useRealTimers();
  });

  it('should not call logout before timer expires', () => {
    vi.useFakeTimers();
    const spy = vi.spyOn(service, 'logout');
    service.startLogoutTimer(5000);
    vi.advanceTimersByTime(2000);
    expect(spy).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  // ===== clearLogoutTimer =====
  it('should clear logout timer without error when no timer set', () => {
    expect(() => service.clearLogoutTimer()).not.toThrow();
  });

  it('should cancel timer on clearLogoutTimer', () => {
    vi.useFakeTimers();
    service.startLogoutTimer(3000);
    service.clearLogoutTimer();
    vi.advanceTimersByTime(3000);
    expect(mockSnackBar.open).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  // ===== checkSession =====
  it('should call logout when session is expired', () => {
    const spy = vi.spyOn(service, 'logout');
    sessionStorage.setItem('expiry', (Date.now() - 1000).toString());
    service.checkSession();
    expect(spy).toHaveBeenCalled();
  });

  it('should start timer when session is still valid', () => {
    const spy = vi.spyOn(service, 'startLogoutTimer');
    sessionStorage.setItem('expiry', (Date.now() + 60000).toString());
    service.checkSession();
    expect(spy).toHaveBeenCalled();
  });

  it('should do nothing when no expiry in storage', () => {
    const spy = vi.spyOn(service, 'logout');
    service.checkSession();
    expect(spy).not.toHaveBeenCalled();
  });

  // ===== login HTTP =====
  it('should POST to login endpoint', () => {
    service.login({ email: 'a@a.com', password: 'pass' }).subscribe();
    const req = httpMock.expectOne(`${base}Login/login`);
    expect(req.request.method).toBe('POST');
    req.flush({ token: MOCK_TOKEN, email: 'a@a.com', role: 'Admin' });
  });

  it('should store token, email, role in sessionStorage after login', () => {
    service.login({ email: 'a@a.com', password: 'pass' }).subscribe();
    httpMock.expectOne(`${base}Login/login`).flush({ token: MOCK_TOKEN, email: 'a@a.com', role: 'Admin' });
    expect(sessionStorage.getItem('token')).toBe(MOCK_TOKEN);
    expect(sessionStorage.getItem('email')).toBe('a@a.com');
    expect(sessionStorage.getItem('role')).toBe('Admin');
  });

  it('should store expiry in sessionStorage after login', () => {
    service.login({ email: 'a@a.com', password: 'pass' }).subscribe();
    httpMock.expectOne(`${base}Login/login`).flush({ token: MOCK_TOKEN, email: 'a@a.com', role: 'Admin' });
    expect(sessionStorage.getItem('expiry')).toBeTruthy();
  });

  it('should propagate login error', () => {
    let error: any;
    service.login({ email: 'bad', password: 'bad' }).subscribe({ error: e => error = e });
    httpMock.expectOne(`${base}Login/login`).flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    expect(error.status).toBe(401);
  });

  // ===== loginMpin HTTP =====
  it('should POST to loginWithMpin endpoint', () => {
    service.loginMpin({ mpin: '1234' }).subscribe();
    const req = httpMock.expectOne(`${base}Login/loginWithMpin`);
    expect(req.request.method).toBe('POST');
    req.flush({ token: MOCK_TOKEN, email: 'a@a.com', role: 'Admin' });
  });

  it('should store token after loginMpin', () => {
    service.loginMpin({ mpin: '1234' }).subscribe();
    httpMock.expectOne(`${base}Login/loginWithMpin`).flush({ token: MOCK_TOKEN, email: 'a@a.com', role: 'Admin' });
    expect(sessionStorage.getItem('token')).toBe(MOCK_TOKEN);
  });

  it('should propagate loginMpin error', () => {
    let error: any;
    service.loginMpin({ mpin: '0000' }).subscribe({ error: e => error = e });
    httpMock.expectOne(`${base}Login/loginWithMpin`).flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    expect(error.status).toBe(401);
  });
});
