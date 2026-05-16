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
    service  = TestBed.inject(ProfileService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ===== CREATION =====
  it('should be created', () => expect(service).toBeTruthy());

  // ===== GET =====
  it('should call get endpoint with POST method', () => {
    service.get({ flag: 'GET' }).subscribe();
    const req = httpMock.expectOne(`${base}Admin/Admins`);
    expect(req.request.method).toBe('POST');
    req.flush([]);
  });

  it('should send correct payload to get', () => {
    service.get({ flag: 'GET' }).subscribe();
    const req = httpMock.expectOne(`${base}Admin/Admins`);
    expect(req.request.body).toEqual({ flag: 'GET' });
    req.flush([]);
  });

  it('should return admin list from get', () => {
    const mockAdmins = [{ id: 1, name: 'Admin1', email: 'a@a.com' }];
    let result: any;
    service.get({ flag: 'GET' }).subscribe(res => result = res);
    httpMock.expectOne(`${base}Admin/Admins`).flush(mockAdmins);
    expect(result).toEqual(mockAdmins);
  });

  it('should handle error on get', () => {
    let error: any;
    service.get({ flag: 'GET' }).subscribe({ error: e => error = e });
    httpMock.expectOne(`${base}Admin/Admins`).flush('Error', { status: 500, statusText: 'Server Error' });
    expect(error).toBeTruthy();
  });

  // ===== GET BY ID =====
  it('should call getById endpoint with POST method', () => {
    service.getById({ email: 'a@a.com' }).subscribe();
    const req = httpMock.expectOne(`${base}Admin/AdminById`);
    expect(req.request.method).toBe('POST');
    req.flush([]);
  });

  it('should send correct email to getById', () => {
    service.getById({ email: 'test@test.com' }).subscribe();
    const req = httpMock.expectOne(`${base}Admin/AdminById`);
    expect(req.request.body).toEqual({ email: 'test@test.com' });
    req.flush([]);
  });

  it('should return admin data from getById', () => {
    const mockAdmin = { id: 1, name: 'Test', email: 'a@a.com', role: 'Admin' };
    let result: any;
    service.getById({ email: 'a@a.com' }).subscribe(res => result = res);
    httpMock.expectOne(`${base}Admin/AdminById`).flush([mockAdmin]);
    expect(result[0]).toEqual(mockAdmin);
  });

  it('should handle error on getById', () => {
    let error: any;
    service.getById({ email: 'x@x.com' }).subscribe({ error: e => error = e });
    httpMock.expectOne(`${base}Admin/AdminById`).flush('Not Found', { status: 404, statusText: 'Not Found' });
    expect(error).toBeTruthy();
  });

  // ===== CREATE =====
  it('should call create endpoint with POST method', () => {
    service.create({ name: 'Test', email: 'a@a.com', password: 'pass123' }).subscribe();
    const req = httpMock.expectOne(`${base}Login/register`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should send full payload to create', () => {
    const payload = { name: 'Test User', email: 'test@test.com', mobile: '9876543210', role: 'Admin', password: 'pass123' };
    service.create(payload).subscribe();
    const req = httpMock.expectOne(`${base}Login/register`);
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 1 });
  });

  it('should return created admin response', () => {
    let result: any;
    service.create({ name: 'Test' }).subscribe(res => result = res);
    httpMock.expectOne(`${base}Login/register`).flush({ id: 1, name: 'Test' });
    expect(result.id).toBe(1);
  });

  it('should handle error on create', () => {
    let error: any;
    service.create({ email: 'existing@test.com' }).subscribe({ error: e => error = e });
    httpMock.expectOne(`${base}Login/register`).flush('Conflict', { status: 409, statusText: 'Conflict' });
    expect(error).toBeTruthy();
  });

  // ===== UPDATE =====
  it('should call update endpoint with POST method', () => {
    service.update({ name: 'Updated' }).subscribe();
    const req = httpMock.expectOne(`${base}Admin/Adminupdate`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should send correct payload to update', () => {
    const payload = { name: 'Updated Name', mobile: '9876543210', role: 'Admin', email: 'a@a.com' };
    service.update(payload).subscribe();
    const req = httpMock.expectOne(`${base}Admin/Adminupdate`);
    expect(req.request.body).toEqual(payload);
    req.flush({});
  });

  it('should return update response', () => {
    let result: any;
    service.update({ name: 'Test' }).subscribe(res => result = res);
    httpMock.expectOne(`${base}Admin/Adminupdate`).flush({ success: true });
    expect(result.success).toBe(true);
  });

  it('should handle error on update', () => {
    let error: any;
    service.update({ email: 'x@x.com' }).subscribe({ error: e => error = e });
    httpMock.expectOne(`${base}Admin/Adminupdate`).flush('Not Found', { status: 404, statusText: 'Not Found' });
    expect(error).toBeTruthy();
  });

  // ===== DELETE =====
  it('should call delete endpoint with POST method', () => {
    service.delete({ email: 'a@a.com' }).subscribe();
    const req = httpMock.expectOne(`${base}Admin/AdminDelete`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should send correct email to delete', () => {
    service.delete({ email: 'del@test.com' }).subscribe();
    const req = httpMock.expectOne(`${base}Admin/AdminDelete`);
    expect(req.request.body).toEqual({ email: 'del@test.com' });
    req.flush({});
  });

  it('should return delete response', () => {
    let result: any;
    service.delete({ email: 'a@a.com' }).subscribe(res => result = res);
    httpMock.expectOne(`${base}Admin/AdminDelete`).flush({ deleted: true });
    expect(result.deleted).toBe(true);
  });

  it('should handle error on delete', () => {
    let error: any;
    service.delete({ email: 'x@x.com' }).subscribe({ error: e => error = e });
    httpMock.expectOne(`${base}Admin/AdminDelete`).flush('Not Found', { status: 404, statusText: 'Not Found' });
    expect(error).toBeTruthy();
  });

  // ===== RESET PASSWORD =====
  it('should call resetPassword endpoint with POST method', () => {
    service.resetPassword({ email: 'a@a.com', newPassword: 'newpass' }).subscribe();
    const req = httpMock.expectOne(`${base}Admin/ResetPassword`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should send correct payload to resetPassword', () => {
    const payload = { email: 'a@a.com', newPassword: 'newpass123' };
    service.resetPassword(payload).subscribe();
    const req = httpMock.expectOne(`${base}Admin/ResetPassword`);
    expect(req.request.body).toEqual(payload);
    req.flush({});
  });

  it('should return resetPassword response', () => {
    let result: any;
    service.resetPassword({ email: 'a@a.com', newPassword: 'pass' }).subscribe(res => result = res);
    httpMock.expectOne(`${base}Admin/ResetPassword`).flush({ success: true });
    expect(result.success).toBe(true);
  });

  it('should handle error on resetPassword', () => {
    let error: any;
    service.resetPassword({ email: 'x@x.com' }).subscribe({ error: e => error = e });
    httpMock.expectOne(`${base}Admin/ResetPassword`).flush('Bad Request', { status: 400, statusText: 'Bad Request' });
    expect(error).toBeTruthy();
  });

  // ===== ADD MPIN =====
  it('should call addMpin endpoint with POST method', () => {
    service.addMpin({ mpin: '1234', email: 'a@a.com' }).subscribe();
    const req = httpMock.expectOne(`${base}Admin/AddMpin`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should send correct payload to addMpin', () => {
    const payload = { mpin: '1234', email: 'a@a.com' };
    service.addMpin(payload).subscribe();
    const req = httpMock.expectOne(`${base}Admin/AddMpin`);
    expect(req.request.body).toEqual(payload);
    req.flush({});
  });

  it('should return addMpin response', () => {
    let result: any;
    service.addMpin({ mpin: '1234' }).subscribe(res => result = res);
    httpMock.expectOne(`${base}Admin/AddMpin`).flush({ success: true });
    expect(result.success).toBe(true);
  });

  it('should handle error on addMpin', () => {
    let error: any;
    service.addMpin({ mpin: '' }).subscribe({ error: e => error = e });
    httpMock.expectOne(`${base}Admin/AddMpin`).flush('Bad Request', { status: 400, statusText: 'Bad Request' });
    expect(error).toBeTruthy();
  });

  // ===== CHECK MPIN =====
  it('should call CheckMpin endpoint with POST method', () => {
    service.CheckMpin({ email: 'a@a.com' }).subscribe();
    const req = httpMock.expectOne(`${base}Admin/CheckMpin`);
    expect(req.request.method).toBe('POST');
    req.flush([{ status: 1 }]);
  });

  it('should send correct email to CheckMpin', () => {
    service.CheckMpin({ email: 'check@test.com' }).subscribe();
    const req = httpMock.expectOne(`${base}Admin/CheckMpin`);
    expect(req.request.body).toEqual({ email: 'check@test.com' });
    req.flush([{ status: 1 }]);
  });

  it('should return status 0 when MPIN not set', () => {
    let result: any;
    service.CheckMpin({ email: 'a@a.com' }).subscribe(res => result = res);
    httpMock.expectOne(`${base}Admin/CheckMpin`).flush([{ status: 0, message: 'MPIN not found' }]);
    expect(result[0].status).toBe(0);
  });

  it('should return status 1 when MPIN is set', () => {
    let result: any;
    service.CheckMpin({ email: 'a@a.com' }).subscribe(res => result = res);
    httpMock.expectOne(`${base}Admin/CheckMpin`).flush([{ status: 1, message: 'MPIN found' }]);
    expect(result[0].status).toBe(1);
  });

  it('should handle error on CheckMpin', () => {
    let error: any;
    service.CheckMpin({ email: 'x@x.com' }).subscribe({ error: e => error = e });
    httpMock.expectOne(`${base}Admin/CheckMpin`).flush('Error', { status: 500, statusText: 'Server Error' });
    expect(error).toBeTruthy();
  });
});
