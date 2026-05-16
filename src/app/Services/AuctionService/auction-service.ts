import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuctionService {
    private baseUrl = environment.apiBaseUrl;
  private readonly http = inject(HttpClient);

    get(data: any): Observable<any> {
      return this.http.post<any>(`${this.baseUrl}Auction/Auction`, data).pipe(
              catchError((error) => {
        console.error('User API Error:', error);
        return throwError(() => error);
      })
      );
    }
        getById(data: any): Observable<any> {
      return this.http.post<any>(`${this.baseUrl}Auction/AuctionById`, data).pipe(
              catchError((error) => {
        console.error('User API Error:', error);
        return throwError(() => error);
      })
      );
    }
        update(data: any): Observable<any> {
      return this.http.post<any>(`${this.baseUrl}Auction/Auctionupdate`, data).pipe(
              catchError((error) => {
        console.error('User API Error:', error);
        return throwError(() => error);
      })
      );
    }
    delete(data: any): Observable<any> {
      return this.http.post<any>(`${this.baseUrl}Auction/AuctionDelete`, data).pipe(
              catchError((error) => {
        console.error('User API Error:', error);
        return throwError(() => error);
      })
      );
    }
        create(data: any): Observable<any> {
      return this.http.post<any>(`${this.baseUrl}Auction/AuctionCreate`, data).pipe(
              catchError((error) => {
        console.error('User API Error:', error);
        return throwError(() => error);
      })
      );
    }
}
