import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Login } from './login';
import { Login as LoginService } from '../../Services/Login/login';

import { Router, provideRouter } from '@angular/router';

import { of, throwError } from 'rxjs';

import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { provideHttpClient } from '@angular/common/http';

import { provideHttpClientTesting } from '@angular/common/http/testing';

@Component({
  standalone: true,
  template: '',
})
class DummyComponent {}

const mockLoginService = {
  login: vi.fn(),

  loginMpin: vi.fn(),

  isLoggedIn: vi.fn().mockReturnValue(false),

  checkSession: vi.fn(),
};

describe('Login Component', () => {

  let component: Login;

  let fixture: ComponentFixture<Login>;

  let router: Router;

  beforeEach(async () => {

    mockLoginService.login.mockReset();

    mockLoginService.loginMpin.mockReset();

    mockLoginService.checkSession.mockReset();

    await TestBed.configureTestingModule({
      imports: [Login],

      providers: [

        provideNoopAnimations(),

        provideHttpClient(),

        provideHttpClientTesting(),

        provideRouter([
          {
            path: 'login',
            component: DummyComponent,
          },
          {
            path: 'home',
            component: DummyComponent,
          },
        ]),

        {
          provide: LoginService,
          useValue: mockLoginService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);

    component = fixture.componentInstance;

    router = TestBed.inject(Router);

    fixture.detectChanges();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create', () => {

    expect(component).toBeTruthy();

  });

  it('should have invalid form initially', () => {

    expect(component.loginForm.invalid).toBe(true);

  });

  it('should not call login if form is invalid', () => {

    component.onSubmit();

    expect(mockLoginService.login).not.toHaveBeenCalled();

  });

  it('should call login service on valid submit', () => {

    mockLoginService.login.mockReturnValue(
      of({})
    );

    component.loginForm.setValue({
      username: 'test@test.com',
      password: 'password123',
    });

    component.onSubmit();

    expect(mockLoginService.login).toHaveBeenCalled();

  });

  it('should set errorMsg on 401', () => {

    mockLoginService.login.mockReturnValue(
      throwError(() => ({
        status: 401,
      }))
    );

    component.loginForm.setValue({
      username: 'test@test.com',
      password: 'password123',
    });

    component.onSubmit();

    expect(component.errorMsg).toBe(
      'Invalid email or password'
    );

  });

  it('should set errorMsg on server unreachable', () => {

    mockLoginService.login.mockReturnValue(
      throwError(() => ({
        status: 0,
      }))
    );

    component.loginForm.setValue({
      username: 'test@test.com',
      password: 'password123',
    });

    component.onSubmit();

    expect(component.errorMsg).toBe(
      'Server not reachable'
    );

  });

  it('should toggle password visibility', () => {

    expect(component.hidePassword()).toBe(true);

    component.togglePassword();

    expect(component.hidePassword()).toBe(false);

  });

  it('should clear errorMsg on tab change', () => {

    component.errorMsg = 'some error';

    component.onTabChange();

    expect(component.errorMsg).toBe('');

  });

  it('should call loginMpin on valid mpin submit', () => {

    mockLoginService.loginMpin.mockReturnValue(
      of({})
    );

    component.loginMpinForm.setValue({
      mpin: '1234',
    });

    component.onSubmitMpin();

    expect(mockLoginService.loginMpin)
      .toHaveBeenCalled();

  });

});