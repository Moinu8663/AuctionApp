import { TestBed } from '@angular/core/testing';
import { PlayerService } from './player-service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';

describe('PlayerService', () => {
  let service: PlayerService;
  let httpMock: HttpTestingController;
  const base = environment.apiBaseUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PlayerService, provideHttpClient(), provideHttpClientTesting()],
    });
    service  = TestBed.inject(PlayerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ===== CREATION =====
  it('should be created', () => expect(service).toBeTruthy());

  // ===== GET =====
  it('should call get endpoint with POST method', () => {
    service.get({ flag: 'GET' }).subscribe();
    const req = httpMock.expectOne(`${base}Player/Players`);
    expect(req.request.method).toBe('POST');
    req.flush([]);
  });

  it('should send correct payload to get', () => {
    service.get({ flag: 'GET' }).subscribe();
    const req = httpMock.expectOne(`${base}Player/Players`);
    expect(req.request.body).toEqual({ flag: 'GET' });
    req.flush([]);
  });

  it('should return player list from get', () => {
    const mockPlayers = [
      { id: 1, playerName: 'Virat Kohli', role: 'Batsman', country: 'India' },
      { id: 2, playerName: 'Rohit Sharma', role: 'Batsman', country: 'India' },
    ];
    let result: any;
    service.get({ flag: 'GET' }).subscribe(res => result = res);
    httpMock.expectOne(`${base}Player/Players`).flush(mockPlayers);
    expect(result).toEqual(mockPlayers);
    expect(result.length).toBe(2);
  });

  it('should return empty array when no players', () => {
    let result: any;
    service.get({ flag: 'GET' }).subscribe(res => result = res);
    httpMock.expectOne(`${base}Player/Players`).flush([]);
    expect(result).toEqual([]);
  });

  it('should handle error on get', () => {
    let error: any;
    service.get({ flag: 'GET' }).subscribe({ error: e => error = e });
    httpMock.expectOne(`${base}Player/Players`).flush('Error', { status: 500, statusText: 'Server Error' });
    expect(error).toBeTruthy();
  });

  // ===== GET BY ID =====
  it('should call getById endpoint with POST method', () => {
    service.getById({ id: 1 }).subscribe();
    const req = httpMock.expectOne(`${base}Player/PlayerById`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should send correct id to getById', () => {
    service.getById({ id: 5 }).subscribe();
    const req = httpMock.expectOne(`${base}Player/PlayerById`);
    expect(req.request.body).toEqual({ id: 5 });
    req.flush({});
  });

  it('should return single player from getById', () => {
    const mockPlayer = { id: 1, playerName: 'Virat Kohli', role: 'Batsman', age: 35, country: 'India' };
    let result: any;
    service.getById({ id: 1 }).subscribe(res => result = res);
    httpMock.expectOne(`${base}Player/PlayerById`).flush(mockPlayer);
    expect(result).toEqual(mockPlayer);
    expect(result.playerName).toBe('Virat Kohli');
  });

  it('should handle 404 error on getById', () => {
    let error: any;
    service.getById({ id: 999 }).subscribe({ error: e => error = e });
    httpMock.expectOne(`${base}Player/PlayerById`).flush('Not Found', { status: 404, statusText: 'Not Found' });
    expect(error.status).toBe(404);
  });

  // ===== CREATE =====
  it('should call create endpoint with POST method', () => {
    service.create({ playerName: 'Virat Kohli' }).subscribe();
    const req = httpMock.expectOne(`${base}Player/PlayerCreate`);
    expect(req.request.method).toBe('POST');
    req.flush({ id: 1 });
  });

  it('should send full payload to create', () => {
    const payload = {
      playerName: 'Virat Kohli', age: 35, mobile: '9876543210',
      email: 'virat@test.com', country: 'India', role: 'Batsman',
      basePrice: 2000000, auctionId: 1, created_By: 'admin@test.com'
    };
    service.create(payload).subscribe();
    const req = httpMock.expectOne(`${base}Player/PlayerCreate`);
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 1 });
  });

  it('should return created player response', () => {
    let result: any;
    service.create({ playerName: 'Virat' }).subscribe(res => result = res);
    httpMock.expectOne(`${base}Player/PlayerCreate`).flush({ id: 1, playerName: 'Virat' });
    expect(result.id).toBe(1);
    expect(result.playerName).toBe('Virat');
  });

  it('should handle 400 error on create', () => {
    let error: any;
    service.create({ playerName: '' }).subscribe({ error: e => error = e });
    httpMock.expectOne(`${base}Player/PlayerCreate`).flush('Bad Request', { status: 400, statusText: 'Bad Request' });
    expect(error.status).toBe(400);
  });

  // ===== UPDATE =====
  it('should call update endpoint with POST method', () => {
    service.update({ id: 1, playerName: 'Virat Updated' }).subscribe();
    const req = httpMock.expectOne(`${base}Player/Playerupdate`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should send correct payload to update', () => {
    const payload = { id: 1, playerName: 'Virat Updated', age: 36, role: 'Batsman', basePrice: 2500000 };
    service.update(payload).subscribe();
    const req = httpMock.expectOne(`${base}Player/Playerupdate`);
    expect(req.request.body).toEqual(payload);
    req.flush({});
  });

  it('should return update success response', () => {
    let result: any;
    service.update({ id: 1 }).subscribe(res => result = res);
    httpMock.expectOne(`${base}Player/Playerupdate`).flush({ success: true });
    expect(result.success).toBe(true);
  });

  it('should handle 404 error on update', () => {
    let error: any;
    service.update({ id: 999 }).subscribe({ error: e => error = e });
    httpMock.expectOne(`${base}Player/Playerupdate`).flush('Not Found', { status: 404, statusText: 'Not Found' });
    expect(error.status).toBe(404);
  });

  // ===== DELETE =====
  it('should call delete endpoint with POST method', () => {
    service.delete({ id: 1 }).subscribe();
    const req = httpMock.expectOne(`${base}Player/PlayerDelete`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should send correct id to delete', () => {
    service.delete({ id: 3 }).subscribe();
    const req = httpMock.expectOne(`${base}Player/PlayerDelete`);
    expect(req.request.body).toEqual({ id: 3 });
    req.flush({});
  });

  it('should return delete success response', () => {
    let result: any;
    service.delete({ id: 1 }).subscribe(res => result = res);
    httpMock.expectOne(`${base}Player/PlayerDelete`).flush({ deleted: true });
    expect(result.deleted).toBe(true);
  });

  it('should handle 404 error on delete', () => {
    let error: any;
    service.delete({ id: 999 }).subscribe({ error: e => error = e });
    httpMock.expectOne(`${base}Player/PlayerDelete`).flush('Not Found', { status: 404, statusText: 'Not Found' });
    expect(error.status).toBe(404);
  });
});
