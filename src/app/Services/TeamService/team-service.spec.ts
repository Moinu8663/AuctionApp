import { TestBed } from '@angular/core/testing';
import { TeamService } from './team-service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';

describe('TeamService', () => {
  let service: TeamService;
  let httpMock: HttpTestingController;
  const base = environment.apiBaseUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TeamService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TeamService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ===== CREATION =====
  it('should be created', () => expect(service).toBeTruthy());

  // ===== GET =====
  it('should call GET endpoint with POST method', () => {
    service.get({ flag: 'GET' }).subscribe();
    const req = httpMock.expectOne(`${base}Team/Team`);
    expect(req.request.method).toBe('POST');
    req.flush([]);
  });

  it('should send correct payload to get', () => {
    service.get({ flag: 'GET' }).subscribe();
    const req = httpMock.expectOne(`${base}Team/Team`);
    expect(req.request.body).toEqual({ flag: 'GET' });
    req.flush([]);
  });

  it('should return team list from get', () => {
    const mockTeams = [{ id: 1, teamName: 'MI' }, { id: 2, teamName: 'CSK' }];
    let result: any;
    service.get({ flag: 'GET' }).subscribe(res => result = res);
    httpMock.expectOne(`${base}Team/Team`).flush(mockTeams);
    expect(result).toEqual(mockTeams);
  });

  it('should handle error on get', () => {
    let error: any;
    service.get({ flag: 'GET' }).subscribe({ error: e => error = e });
    httpMock.expectOne(`${base}Team/Team`).flush('Error', { status: 500, statusText: 'Server Error' });
    expect(error).toBeTruthy();
  });

  // ===== GET BY ID =====
  it('should call getById endpoint', () => {
    service.getById({ id: 1 }).subscribe();
    const req = httpMock.expectOne(`${base}Team/TeamById`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should send correct id to getById', () => {
    service.getById({ id: 5 }).subscribe();
    const req = httpMock.expectOne(`${base}Team/TeamById`);
    expect(req.request.body).toEqual({ id: 5 });
    req.flush({});
  });

  it('should return single team from getById', () => {
    const mockTeam = { id: 1, teamName: 'MI', ownerName: 'Mukesh' };
    let result: any;
    service.getById({ id: 1 }).subscribe(res => result = res);
    httpMock.expectOne(`${base}Team/TeamById`).flush(mockTeam);
    expect(result).toEqual(mockTeam);
  });

  it('should handle error on getById', () => {
    let error: any;
    service.getById({ id: 99 }).subscribe({ error: e => error = e });
    httpMock.expectOne(`${base}Team/TeamById`).flush('Not Found', { status: 404, statusText: 'Not Found' });
    expect(error).toBeTruthy();
  });

  // ===== CREATE =====
  it('should call create endpoint', () => {
    service.create({ teamName: 'MI' }).subscribe();
    const req = httpMock.expectOne(`${base}Team/TeamCreate`);
    expect(req.request.method).toBe('POST');
    req.flush({ id: 1 });
  });

  it('should send full payload to create', () => {
    const payload = { teamName: 'MI', ownerName: 'Mukesh', purse: 1000000, auctionId: 1, created_By: 'admin@test.com' };
    service.create(payload).subscribe();
    const req = httpMock.expectOne(`${base}Team/TeamCreate`);
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 1 });
  });

  it('should return created team response', () => {
    let result: any;
    service.create({ teamName: 'MI' }).subscribe(res => result = res);
    httpMock.expectOne(`${base}Team/TeamCreate`).flush({ id: 1, teamName: 'MI' });
    expect(result.id).toBe(1);
  });

  it('should handle error on create', () => {
    let error: any;
    service.create({ teamName: '' }).subscribe({ error: e => error = e });
    httpMock.expectOne(`${base}Team/TeamCreate`).flush('Bad Request', { status: 400, statusText: 'Bad Request' });
    expect(error).toBeTruthy();
  });

  // ===== UPDATE =====
  it('should call update endpoint', () => {
    service.update({ id: 1, teamName: 'MI Updated' }).subscribe();
    const req = httpMock.expectOne(`${base}Team/Teamupdate`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should send correct payload to update', () => {
    const payload = { id: 1, teamName: 'MI Updated', ownerName: 'Mukesh', purse: 2000000 };
    service.update(payload).subscribe();
    const req = httpMock.expectOne(`${base}Team/Teamupdate`);
    expect(req.request.body).toEqual(payload);
    req.flush({});
  });

  it('should return updated response', () => {
    let result: any;
    service.update({ id: 1 }).subscribe(res => result = res);
    httpMock.expectOne(`${base}Team/Teamupdate`).flush({ success: true });
    expect(result.success).toBe(true);
  });

  it('should handle error on update', () => {
    let error: any;
    service.update({ id: 999 }).subscribe({ error: e => error = e });
    httpMock.expectOne(`${base}Team/Teamupdate`).flush('Not Found', { status: 404, statusText: 'Not Found' });
    expect(error).toBeTruthy();
  });

  // ===== DELETE =====
  it('should call delete endpoint', () => {
    service.delete({ id: 1 }).subscribe();
    const req = httpMock.expectOne(`${base}Team/TeamDelete`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should send correct id to delete', () => {
    service.delete({ id: 3 }).subscribe();
    const req = httpMock.expectOne(`${base}Team/TeamDelete`);
    expect(req.request.body).toEqual({ id: 3 });
    req.flush({});
  });

  it('should return delete response', () => {
    let result: any;
    service.delete({ id: 1 }).subscribe(res => result = res);
    httpMock.expectOne(`${base}Team/TeamDelete`).flush({ deleted: true });
    expect(result.deleted).toBe(true);
  });

  it('should handle error on delete', () => {
    let error: any;
    service.delete({ id: 999 }).subscribe({ error: e => error = e });
    httpMock.expectOne(`${base}Team/TeamDelete`).flush('Not Found', { status: 404, statusText: 'Not Found' });
    expect(error).toBeTruthy();
  });
});
