import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { isPlatformBrowser } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class Login {
  private baseUrl = environment.apiBaseUrl;
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private logoutTimer: any;

  // helper method
  private getStorage() {
    return this.isBrowser ? sessionStorage : null;
  }

  login(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}Login/login`, data).pipe(
      tap((res) => {
        const token = res.token;
        this.getStorage()?.setItem('token', token);
        this.getStorage()?.setItem('email', res.email);
        this.getStorage()?.setItem('role', res.role);

        // ✅ Decode JWT
        const decoded: any = jwtDecode(token);

        // exp is in seconds → convert to ms
        const expiryTime = decoded.exp * 1000;

        // remaining time
        const remainingTime = expiryTime - Date.now();

        // store expiry (optional but useful for refresh)
        this.getStorage()?.setItem('expiry', expiryTime.toString());

        // start timer
        this.startLogoutTimer(remainingTime);
      })
    );
  }
    loginMpin(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}Login/loginWithMpin`, data).pipe(
      tap((res) => {
        const token = res.token;
        this.getStorage()?.setItem('token', token);
        this.getStorage()?.setItem('email', res.email);
        this.getStorage()?.setItem('role', res.role);

        // ✅ Decode JWT
        const decoded: any = jwtDecode(token);

        // exp is in seconds → convert to ms
        const expiryTime = decoded.exp * 1000;

        // remaining time
        const remainingTime = expiryTime - Date.now();

        // store expiry (optional but useful for refresh)
        this.getStorage()?.setItem('expiry', expiryTime.toString());

        // start timer
        this.startLogoutTimer(remainingTime);
      })
    );
  }

  // ✅ AUTO LOGOUT TIMER
  startLogoutTimer(duration: number) {
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

  // ✅ RESTORE SESSION AFTER REFRESH
  checkSession() {
      const storage = this.getStorage();
  if (!storage) return;

  const expiry = storage.getItem('expiry');

    if (expiry) {
      const remaining = +expiry - Date.now();

      if (remaining > 0) {
        this.startLogoutTimer(remaining);
      } else {
        this.logout();
      }
    }
  }

  // ✅ CLEAR TIMER
  clearLogoutTimer() {
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
    }
  }

  // ✅ MANUAL LOGOUT
  logout() {
    this.clearLogoutTimer();

  const storage = this.getStorage();
  storage?.clear(); 

  if (this.isBrowser) {
    this.router.navigate(['/login']);
  }

  }

  isLoggedIn(): boolean {
    const storage = this.getStorage();
    return !!storage?.getItem('token');
  }

  getRole(): string | null {
    const storage = this.getStorage();
    return storage?.getItem('role') ?? null;
  }

}
