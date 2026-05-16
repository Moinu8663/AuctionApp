import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MenuAccessService {
      private baseUrl = environment.apiBaseUrl;
  private readonly http = inject(HttpClient);

        getById(data: any): Observable<any> {
      return this.http.post<any>(`${this.baseUrl}MenuAccess/MenuAccessById`, data).pipe(
              catchError((error) => {
        console.error('User API Error:', error);
        return throwError(() => error);
      })
      );
    }
    delete(data: any): Observable<any> {
      return this.http.post<any>(`${this.baseUrl}MenuAccess/MenuAccessDelete`, data).pipe(
              catchError((error) => {
        console.error('User API Error:', error);
        return throwError(() => error);
      })
      );
    }
        create(data: any): Observable<any> {
      return this.http.post<any>(`${this.baseUrl}MenuAccess/MenuAccessCreate`, data).pipe(
              catchError((error) => {
        console.error('User API Error:', error);
        return throwError(() => error);
      })
      );
    }

}
