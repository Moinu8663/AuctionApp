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

  it('should be created', () => expect(service).toBeTruthy());

  it('should call get endpoint', () => {
    service.get({ flag: 'GET' }).subscribe();
    const req = httpMock.expectOne(`${base}Team/Team`);
    expect(req.request.method).toBe('POST');
    req.flush([]);
  });

  it('should call getById endpoint', () => {
    service.getById({ id: 1 }).subscribe();
    const req = httpMock.expectOne(`${base}Team/TeamById`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should call create endpoint', () => {
    service.create({ teamName: 'MI' }).subscribe();
    const req = httpMock.expectOne(`${base}Team/TeamCreate`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should call update endpoint', () => {
    service.update({ id: 1 }).subscribe();
    const req = httpMock.expectOne(`${base}Team/Teamupdate`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should call delete endpoint', () => {
    service.delete({ id: 1 }).subscribe();
    const req = httpMock.expectOne(`${base}Team/TeamDelete`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });
});
