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
    service  = TestBed.inject(AuctionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ===== CREATION =====
  it('should be created', () => expect(service).toBeTruthy());

  // ===== GET =====
  it('should call get endpoint with POST method', () => {
    service.get({ flag: 'GET' }).subscribe();
    const req = httpMock.expectOne(`${base}Auction/Auction`);
    expect(req.request.method).toBe('POST');
    req.flush([]);
  });

  it('should send correct payload to get', () => {
    service.get({ flag: 'GET' }).subscribe();
    const req = httpMock.expectOne(`${base}Auction/Auction`);
    expect(req.request.body).toEqual({ flag: 'GET' });
    req.flush([]);
  });

  it('should return auction list from get', () => {
    const mockAuctions = [
      { auctionId: 1, auctionName: 'IPL 2026', status: 'live' },
      { auctionId: 2, auctionName: 'BBL 2026', status: 'upcoming' },
    ];
    let result: any;
    service.get({ flag: 'GET' }).subscribe(res => result = res);
    httpMock.expectOne(`${base}Auction/Auction`).flush(mockAuctions);
    expect(result).toEqual(mockAuctions);
    expect(result.length).toBe(2);
  });

  it('should return empty array when no auctions', () => {
    let result: any;
    service.get({ flag: 'GET' }).subscribe(res => result = res);
    httpMock.expectOne(`${base}Auction/Auction`).flush([]);
    expect(result).toEqual([]);
  });

  it('should handle error on get', () => {
    let error: any;
    service.get({ flag: 'GET' }).subscribe({ error: e => error = e });
    httpMock.expectOne(`${base}Auction/Auction`).flush('Error', { status: 500, statusText: 'Server Error' });
    expect(error).toBeTruthy();
    expect(error.status).toBe(500);
  });

  // ===== GET BY ID =====
  it('should call getById endpoint with POST method', () => {
    service.getById({ id: 1 }).subscribe();
    const req = httpMock.expectOne(`${base}Auction/AuctionById`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should send correct id to getById', () => {
    service.getById({ id: 5 }).subscribe();
    const req = httpMock.expectOne(`${base}Auction/AuctionById`);
    expect(req.request.body).toEqual({ id: 5 });
    req.flush({});
  });

  it('should return single auction from getById', () => {
    const mockAuction = { auctionId: 1, auctionName: 'IPL 2026', status: 'live', baseBudget: 5000000 };
    let result: any;
    service.getById({ id: 1 }).subscribe(res => result = res);
    httpMock.expectOne(`${base}Auction/AuctionById`).flush(mockAuction);
    expect(result).toEqual(mockAuction);
    expect(result.auctionName).toBe('IPL 2026');
  });

  it('should handle 404 error on getById', () => {
    let error: any;
    service.getById({ id: 999 }).subscribe({ error: e => error = e });
    httpMock.expectOne(`${base}Auction/AuctionById`).flush('Not Found', { status: 404, statusText: 'Not Found' });
    expect(error.status).toBe(404);
  });

  // ===== CREATE =====
  it('should call create endpoint with POST method', () => {
    service.create({ auctionName: 'IPL 2026' }).subscribe();
    const req = httpMock.expectOne(`${base}Auction/AuctionCreate`);
    expect(req.request.method).toBe('POST');
    req.flush({ auctionId: 1 });
  });

  it('should send full payload to create', () => {
    const payload = {
      auctionName: 'IPL 2026', auctionDate: '2026-04-01',
      startTime: '10:00', endTime: '18:00',
      baseBudget: 5000000, status: 'upcoming', created_By: 'admin@test.com'
    };
    service.create(payload).subscribe();
    const req = httpMock.expectOne(`${base}Auction/AuctionCreate`);
    expect(req.request.body).toEqual(payload);
    req.flush({ auctionId: 1 });
  });

  it('should return created auction response', () => {
    let result: any;
    service.create({ auctionName: 'IPL 2026' }).subscribe(res => result = res);
    httpMock.expectOne(`${base}Auction/AuctionCreate`).flush({ auctionId: 1, auctionName: 'IPL 2026' });
    expect(result.auctionId).toBe(1);
    expect(result.auctionName).toBe('IPL 2026');
  });

  it('should handle 400 error on create', () => {
    let error: any;
    service.create({ auctionName: '' }).subscribe({ error: e => error = e });
    httpMock.expectOne(`${base}Auction/AuctionCreate`).flush('Bad Request', { status: 400, statusText: 'Bad Request' });
    expect(error.status).toBe(400);
  });

  // ===== UPDATE =====
  it('should call update endpoint with POST method', () => {
    service.update({ id: 1, auctionName: 'IPL Updated' }).subscribe();
    const req = httpMock.expectOne(`${base}Auction/Auctionupdate`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should send correct payload to update', () => {
    const payload = { id: 1, auctionName: 'IPL Updated', status: 'live', baseBudget: 6000000 };
    service.update(payload).subscribe();
    const req = httpMock.expectOne(`${base}Auction/Auctionupdate`);
    expect(req.request.body).toEqual(payload);
    req.flush({});
  });

  it('should return update success response', () => {
    let result: any;
    service.update({ id: 1 }).subscribe(res => result = res);
    httpMock.expectOne(`${base}Auction/Auctionupdate`).flush({ success: true });
    expect(result.success).toBe(true);
  });

  it('should handle 404 error on update', () => {
    let error: any;
    service.update({ id: 999 }).subscribe({ error: e => error = e });
    httpMock.expectOne(`${base}Auction/Auctionupdate`).flush('Not Found', { status: 404, statusText: 'Not Found' });
    expect(error.status).toBe(404);
  });

  // ===== DELETE =====
  it('should call delete endpoint with POST method', () => {
    service.delete({ id: 1 }).subscribe();
    const req = httpMock.expectOne(`${base}Auction/AuctionDelete`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should send correct id to delete', () => {
    service.delete({ id: 3 }).subscribe();
    const req = httpMock.expectOne(`${base}Auction/AuctionDelete`);
    expect(req.request.body).toEqual({ id: 3 });
    req.flush({});
  });

  it('should return delete success response', () => {
    let result: any;
    service.delete({ id: 1 }).subscribe(res => result = res);
    httpMock.expectOne(`${base}Auction/AuctionDelete`).flush({ deleted: true });
    expect(result.deleted).toBe(true);
  });

  it('should handle 404 error on delete', () => {
    let error: any;
    service.delete({ id: 999 }).subscribe({ error: e => error = e });
    httpMock.expectOne(`${base}Auction/AuctionDelete`).flush('Not Found', { status: 404, statusText: 'Not Found' });
    expect(error.status).toBe(404);
  });
});
