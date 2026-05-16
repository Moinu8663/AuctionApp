import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Roleservice {
      private baseUrl = environment.apiBaseUrl;
  private readonly http = inject(HttpClient);

    get(data: any): Observable<any> {
      return this.http.post<any>(`${this.baseUrl}Role/Roles`, data).pipe(
              catchError((error) => {
        console.error('User API Error:', error);
        return throwError(() => error);
      })
      );
    }
        getById(data: any): Observable<any> {
      return this.http.post<any>(`${this.baseUrl}Role/RoleById`, data).pipe(
              catchError((error) => {
        console.error('User API Error:', error);
        return throwError(() => error);
      })
      );
    }
        update(data: any): Observable<any> {
      return this.http.post<any>(`${this.baseUrl}Role/Roleupdate`, data).pipe(
              catchError((error) => {
        console.error('User API Error:', error);
        return throwError(() => error);
      })
      );
    }
    delete(data: any): Observable<any> {
      return this.http.post<any>(`${this.baseUrl}Role/RoleDelete`, data).pipe(
              catchError((error) => {
        console.error('User API Error:', error);
        return throwError(() => error);
      })
      );
    }
        create(data: any): Observable<any> {
      return this.http.post<any>(`${this.baseUrl}Role/RoleCreate`, data).pipe(
              catchError((error) => {
        console.error('User API Error:', error);
        return throwError(() => error);
      })
      );
    }

}
