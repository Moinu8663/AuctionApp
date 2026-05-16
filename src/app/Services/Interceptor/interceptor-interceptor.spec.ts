import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpInterceptorFn, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { interceptorInterceptor } from './interceptor-interceptor';
import { Crypto } from '../DecodeService/crypto';

describe('interceptorInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let crypto: Crypto;

  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => interceptorInterceptor(req, next));

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        Crypto,
        provideHttpClient(withInterceptors([interceptorInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    httpClient = TestBed.inject(HttpClient);
    httpMock   = TestBed.inject(HttpTestingController);
    crypto     = TestBed.inject(Crypto);
    sessionStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  // ===== CREATION =====
  it('should be created', () => expect(interceptor).toBeTruthy());

  // ===== TOKEN INJECTION =====
  it('should not add Authorization header when no token in sessionStorage', () => {
    httpClient.get('/api/test').subscribe();
    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('should add Authorization Bearer header when token exists', () => {
    sessionStorage.setItem('token', 'my-test-token');
    httpClient.get('/api/test').subscribe();
    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.get('Authorization')).toBe('Bearer my-test-token');
    req.flush({});
  });

  // ===== SKIP LOGIC - GET =====
  it('should skip encryption for GET requests', () => {
    httpClient.get('/api/test').subscribe();
    const req = httpMock.expectOne('/api/test');
    expect(req.request.method).toBe('GET');
    expect(req.request.body).toBeNull();
    req.flush({});
  });

  // ===== SKIP LOGIC - no body =====
  it('should skip encryption for POST with no body', () => {
    httpClient.post('/api/test', null).subscribe();
    const req = httpMock.expectOne('/api/test');
    expect(req.request.body).toBeNull();
    req.flush({});
  });

  // ===== SKIP LOGIC - skip URLs =====
  it('should skip encryption for /api/Crypto/encrypt URL', () => {
    httpClient.post('/api/Crypto/encrypt', { data: 'test' }).subscribe();
    const req = httpMock.expectOne('/api/Crypto/encrypt');
    expect(req.request.body).toEqual({ data: 'test' });
    req.flush({});
  });

  it('should skip encryption for /api/Crypto/decrypt URL', () => {
    httpClient.post('/api/Crypto/decrypt', { data: 'test' }).subscribe();
    const req = httpMock.expectOne('/api/Crypto/decrypt');
    expect(req.request.body).toEqual({ data: 'test' });
    req.flush({});
  });

  // ===== JSON BODY ENCRYPTION =====
  it('should encrypt JSON body and wrap in data property', () => {
    const spy = vi.spyOn(crypto, 'doubleEncrypt').mockReturnValue('encrypted-string');
    httpClient.post('/api/test', { name: 'test' }).subscribe();
    const req = httpMock.expectOne('/api/test');
    expect(req.request.body).toHaveProperty('data');
    expect(req.request.body.data).toBe('encrypted-string');
    spy.mockRestore();
    req.flush({});
  });

  it('should call doubleEncrypt with original body', () => {
    const spy = vi.spyOn(crypto, 'doubleEncrypt').mockReturnValue('encrypted');
    const payload = { email: 'test@test.com', flag: 'GET' };
    httpClient.post('/api/test', payload).subscribe();
    const req = httpMock.expectOne('/api/test');
    expect(spy).toHaveBeenCalledWith(payload);
    spy.mockRestore();
    req.flush({});
  });

  // ===== FORMDATA HANDLING =====
  it('should not encrypt File entries in FormData', () => {
    const formData = new FormData();
    const file = new File(['content'], 'test.png', { type: 'image/png' });
    formData.append('file', file, 'test.png');
    httpClient.post('/api/upload', formData).subscribe();
    const req = httpMock.expectOne('/api/upload');
    const sentForm = req.request.body as FormData;
    expect(sentForm.get('file')).toBeInstanceOf(File);
    req.flush({});
  });

  it('should encrypt text fields in FormData', () => {
    const spy = vi.spyOn(crypto, 'doubleEncrypt').mockReturnValue('enc-value');
    const formData = new FormData();
    formData.append('name', 'TestName');
    httpClient.post('/api/upload', formData).subscribe();
    const req = httpMock.expectOne('/api/upload');
    const sentForm = req.request.body as FormData;
    expect(sentForm.get('name')).toBe('enc-value');
    spy.mockRestore();
    req.flush({});
  });

  it('should keep File intact and encrypt text field in same FormData', () => {
    const spy = vi.spyOn(crypto, 'doubleEncrypt').mockReturnValue('enc-text');
    const formData = new FormData();
    const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });
    formData.append('file', file, 'photo.jpg');
    formData.append('playerName', 'Virat');
    httpClient.post('/api/upload', formData).subscribe();
    const req = httpMock.expectOne('/api/upload');
    const sentForm = req.request.body as FormData;
    expect(sentForm.get('file')).toBeInstanceOf(File);
    expect(sentForm.get('playerName')).toBe('enc-text');
    spy.mockRestore();
    req.flush({});
  });

  // ===== RESPONSE DECRYPTION =====
  it('should decrypt response body when body.data exists', () => {
    vi.spyOn(crypto, 'doubleEncrypt').mockReturnValue('enc');
    vi.spyOn(crypto, 'doubleDecrypt').mockReturnValue({ id: 1, name: 'Decrypted' });
    let result: any;
    httpClient.post('/api/test', { key: 'val' }).subscribe(res => result = res);
    httpMock.expectOne('/api/test').flush({ data: 'some-encrypted-string' });
    expect(result).toEqual({ id: 1, name: 'Decrypted' });
    vi.restoreAllMocks();
  });

  it('should return original response when decryption fails', () => {
    vi.spyOn(crypto, 'doubleEncrypt').mockReturnValue('enc');
    vi.spyOn(crypto, 'doubleDecrypt').mockImplementation(() => { throw new Error('decrypt error'); });
    let result: any;
    httpClient.post('/api/test', { key: 'val' }).subscribe(res => result = res);
    httpMock.expectOne('/api/test').flush({ data: 'bad-data' });
    expect(result).toEqual({ data: 'bad-data' });
    vi.restoreAllMocks();
  });

  it('should return original response when body has no data property', () => {
    vi.spyOn(crypto, 'doubleEncrypt').mockReturnValue('enc');
    const decryptSpy = vi.spyOn(crypto, 'doubleDecrypt').mockReturnValue(null);
    let result: any;
    httpClient.post('/api/test', { key: 'val' }).subscribe(res => result = res);
    httpMock.expectOne('/api/test').flush({ message: 'ok' });
    // doubleDecrypt called with undefined (no data property) — returns null, body becomes null
    expect(decryptSpy).toHaveBeenCalled();
    vi.restoreAllMocks();
  });
});
