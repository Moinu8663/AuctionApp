import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { catchError, Observable, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
    private baseUrl = environment.apiBaseUrl;
  private readonly http = inject(HttpClient);

  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

    get(data: any): Observable<any> {
      return this.http.post<any>(`${this.baseUrl}Admin/Admins`, data).pipe(
              catchError((error) => {
        return throwError(() => error);
      })
      );
    }
        getById(data: any): Observable<any> {
      return this.http.post<any>(`${this.baseUrl}Admin/AdminById`, data).pipe(
              catchError((error) => {
        return throwError(() => error);
      })
      );
    }
        update(data: any): Observable<any> {
      return this.http.post<any>(`${this.baseUrl}Admin/Adminupdate`, data).pipe(
              catchError((error) => {
        return throwError(() => error);
      })
      );
    }
    delete(data: any): Observable<any> {
      return this.http.post<any>(`${this.baseUrl}Admin/AdminDelete`, data).pipe(
              catchError((error) => {
        return throwError(() => error);
      })
      );
    }
        resetPassword(data: any): Observable<any> {
      return this.http.post<any>(`${this.baseUrl}Admin/ResetPassword`, data).pipe(
              catchError((error) => {
        return throwError(() => error);
      })
      );
    }
        addMpin(data: any): Observable<any> {
      return this.http.post<any>(`${this.baseUrl}Admin/AddMpin`, data).pipe(
              catchError((error) => {
        return throwError(() => error);
      })
      );
    }
            create(data: any): Observable<any> {
      return this.http.post<any>(`${this.baseUrl}Login/register`, data).pipe(
              catchError((error) => {
        return throwError(() => error);
      })
      );
    }
                CheckMpin(data: any): Observable<any> {
      return this.http.post<any>(`${this.baseUrl}Admin/CheckMpin`, data).pipe(
              catchError((error) => {
        return throwError(() => error);
      })
      );
    }
}
