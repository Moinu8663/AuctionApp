import { TestBed } from '@angular/core/testing';
import { ProfileService } from './ProfileService';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';

describe('ProfileService', () => {
  let service: ProfileService;
  let httpMock: HttpTestingController;
  const base = environment.apiBaseUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProfileService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProfileService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call get endpoint', () => {
    service.get({ flag: 'GET' }).subscribe();
    const req = httpMock.expectOne(`${base}Admin/Admins`);
    expect(req.request.method).toBe('POST');
    req.flush([]);
  });

  it('should call getById endpoint', () => {
    service.getById({ email: 'a@a.com' }).subscribe();
    const req = httpMock.expectOne(`${base}Admin/AdminById`);
    expect(req.request.method).toBe('POST');
    req.flush([]);
  });

  it('should call update endpoint', () => {
    service.update({ name: 'Test' }).subscribe();
    const req = httpMock.expectOne(`${base}Admin/Adminupdate`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should call delete endpoint', () => {
    service.delete({ email: 'a@a.com' }).subscribe();
    const req = httpMock.expectOne(`${base}Admin/AdminDelete`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should call addMpin endpoint', () => {
    service.addMpin({ mpin: '1234' }).subscribe();
    const req = httpMock.expectOne(`${base}Admin/AddMpin`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should call CheckMpin endpoint', () => {
    service.CheckMpin({ email: 'a@a.com' }).subscribe();
    const req = httpMock.expectOne(`${base}Admin/CheckMpin`);
    expect(req.request.method).toBe('POST');
    req.flush([{ status: 1 }]);
  });

  it('should call resetPassword endpoint', () => {
    service.resetPassword({ email: 'a@a.com', newPassword: 'pass' }).subscribe();
    const req = httpMock.expectOne(`${base}Admin/ResetPassword`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });
});
