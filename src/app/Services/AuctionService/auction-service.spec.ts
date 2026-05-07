import { TestBed } from '@angular/core/testing';
import { AuctionService } from './auction-service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';

describe('AuctionService', () => {
  let service: AuctionService;
  let httpMock: HttpTestingController;
  const base = environment.apiBaseUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuctionService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuctionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => expect(service).toBeTruthy());

  it('should call get endpoint', () => {
    service.get({ flag: 'GET' }).subscribe();
    const req = httpMock.expectOne(`${base}Auction/Auction`);
    expect(req.request.method).toBe('POST');
    req.flush([]);
  });

  it('should call getById endpoint', () => {
    service.getById({ id: 1 }).subscribe();
    const req = httpMock.expectOne(`${base}Auction/AuctionById`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should call create endpoint', () => {
    service.create({ auctionName: 'IPL' }).subscribe();
    const req = httpMock.expectOne(`${base}Auction/AuctionCreate`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should call update endpoint', () => {
    service.update({ id: 1 }).subscribe();
    const req = httpMock.expectOne(`${base}Auction/Auctionupdate`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should call delete endpoint', () => {
    service.delete({ id: 1 }).subscribe();
    const req = httpMock.expectOne(`${base}Auction/AuctionDelete`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });
});
