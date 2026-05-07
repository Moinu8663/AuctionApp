import { TestBed } from '@angular/core/testing';

import { Login } from './login';

import { provideHttpClient } from '@angular/common/http';

import {
  provideHttpClientTesting,
  HttpTestingController
} from '@angular/common/http/testing';

import {
  provideRouter,
  Router
} from '@angular/router';

import { Component } from '@angular/core';

import { MatSnackBar } from '@angular/material/snack-bar';

import { provideNoopAnimations } from '@angular/platform-browser/animations';

const mockSnackBar = {
  open: vi.fn()
};

@Component({
  standalone: true,
  template: '',
})
class DummyComponent {}

describe('Login Service', () => {

  let service: Login;

  let httpMock: HttpTestingController;

  let router: Router;

  beforeEach(() => {

    TestBed.configureTestingModule({

      providers: [

        Login,

        provideHttpClient(),

        provideHttpClientTesting(),

        provideRouter([
          {
            path: 'login',
            component: DummyComponent
          },
          {
            path: 'home',
            component: DummyComponent
          }
        ]),

        provideNoopAnimations(),

        {
          provide: MatSnackBar,
          useValue: mockSnackBar
        },
      ],
    });

    service = TestBed.inject(Login);

    httpMock = TestBed.inject(HttpTestingController);

    router = TestBed.inject(Router);
  });

  afterEach(() => {

    httpMock.verify();

    vi.clearAllMocks();

    sessionStorage.clear();

  });

  it('should be created', () => {

    expect(service).toBeTruthy();

  });

  it('should return false for isLoggedIn when no token', () => {

    sessionStorage.clear();

    expect(service.isLoggedIn()).toBe(false);

  });

  it('should return null for getRole when not logged in', () => {

    sessionStorage.clear();

    expect(service.getRole()).toBeNull();

  });

  it('should clear storage and navigate on logout', async () => {

    const spy = vi.spyOn(router, 'navigate');

    sessionStorage.setItem('token', 'abc');

    await service.logout();

    expect(sessionStorage.getItem('token')).toBeNull();

    expect(spy).toHaveBeenCalledWith(['/login']);

  });

  it('should logout immediately if duration <= 0', () => {

    const spy = vi.spyOn(service, 'logout');

    service.startLogoutTimer(0);

    expect(spy).toHaveBeenCalled();

  });

});