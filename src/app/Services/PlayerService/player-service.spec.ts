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
    service = TestBed.inject(PlayerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => expect(service).toBeTruthy());

  it('should call get endpoint', () => {
    service.get({ flag: 'GET' }).subscribe();
    const req = httpMock.expectOne(`${base}Player/Players`);
    expect(req.request.method).toBe('POST');
    req.flush([]);
  });

  it('should call getById endpoint', () => {
    service.getById({ id: 1 }).subscribe();
    const req = httpMock.expectOne(`${base}Player/PlayerById`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should call create endpoint', () => {
    service.create({ playerName: 'Virat' }).subscribe();
    const req = httpMock.expectOne(`${base}Player/PlayerCreate`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should call update endpoint', () => {
    service.update({ id: 1 }).subscribe();
    const req = httpMock.expectOne(`${base}Player/Playerupdate`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should call delete endpoint', () => {
    service.delete({ id: 1 }).subscribe();
    const req = httpMock.expectOne(`${base}Player/PlayerDelete`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });
});
