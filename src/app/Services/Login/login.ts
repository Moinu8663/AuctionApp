import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

interface LoginResponse {
  token: string;
  email: string;
  role: string;
  name?: string;
}

@Injectable({
  providedIn: 'root',
})
export class Login {
  private readonly baseUrl = environment.apiBaseUrl;
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private logoutTimer: ReturnType<typeof setTimeout> | null = null;

  login(data: any): Observable<LoginResponse> {
    return this.authenticate('Login/login', data);
  }

  loginMpin(data: any): Observable<LoginResponse> {
    return this.authenticate('Login/loginWithMpin', data);
  }

  startLogoutTimer(duration: number): void {
    this.clearLogoutTimer();

    if (duration <= 0) {
      this.logout();
      return;
    }

    this.logoutTimer = setTimeout(() => {
      this.logout();
      this.snackBar.open('Session expired. Please login again.', 'OK', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
    }, duration);
  }

  checkSession(): void {
    const storage = this.getStorage();
    if (!storage) return;

    const expiry = Number(storage.getItem('expiry'));
    if (!expiry) return;

    const remaining = expiry - Date.now();
    if (remaining > 0) {
      this.startLogoutTimer(remaining);
    } else {
      this.logout();
    }
  }

  clearLogoutTimer(): void {
    if (!this.logoutTimer) return;

    clearTimeout(this.logoutTimer);
    this.logoutTimer = null;
  }

  logout(): void {
    this.clearLogoutTimer();
    this.getStorage()?.clear();

    if (this.isBrowser) {
      this.router.navigate(['/login']);
    }
  }

  isLoggedIn(): boolean {
    return !!this.getStorage()?.getItem('token');
  }

  getRole(): string | null {
    return this.getStorage()?.getItem('role') ?? null;
  }

  private authenticate(endpoint: string, data: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}${endpoint}`, data).pipe(
      tap((res) => this.storeSession(res))
    );
  }

  private storeSession(res: LoginResponse): void {
    const storage = this.getStorage();
    if (!storage) return;

    const expiryTime = this.getTokenExpiryTime(res.token);

    storage.setItem('token', res.token);
    storage.setItem('email', res.email);
    storage.setItem('role', res.role);
    storage.setItem('name', res.name ?? '');
    storage.setItem('expiry', expiryTime.toString());

    this.startLogoutTimer(expiryTime - Date.now());
  }

  private getStorage(): Storage | null {
    return this.isBrowser ? sessionStorage : null;
  }

  private getTokenExpiryTime(token: string): number {
    const decoded = jwtDecode<{ exp: number }>(token);
    return decoded.exp * 1000;
  }
}
