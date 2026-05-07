import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
    private baseUrl = environment.apiBaseUrl;
  private readonly http = inject(HttpClient);

  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

    get(data: any): Observable<any> {
      return this.http.post<any>(`${this.baseUrl}Player/Players`, data).pipe(
              catchError((error) => {
        console.error('User API Error:', error);
        return throwError(() => error);
      })
      );
    }
        getById(data: any): Observable<any> {
      return this.http.post<any>(`${this.baseUrl}Player/PlayerById`, data).pipe(
              catchError((error) => {
        console.error('User API Error:', error);
        return throwError(() => error);
      })
      );
    }
        update(data: any): Observable<any> {
      return this.http.post<any>(`${this.baseUrl}Player/Playerupdate`, data).pipe(
              catchError((error) => {
        console.error('User API Error:', error);
        return throwError(() => error);
      })
      );
    }
    delete(data: any): Observable<any> {
      return this.http.post<any>(`${this.baseUrl}Player/PlayerDelete`, data).pipe(
              catchError((error) => {
        console.error('User API Error:', error);
        return throwError(() => error);
      })
      );
    }
        create(data: any): Observable<any> {
      return this.http.post<any>(`${this.baseUrl}Player/PlayerCreate`, data).pipe(
              catchError((error) => {
        console.error('User API Error:', error);
        return throwError(() => error);
      })
      );
    }
}
