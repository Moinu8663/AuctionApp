import { TestBed } from '@angular/core/testing';
import { BlobService } from './blob-service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';

describe('BlobService', () => {
  let service: BlobService;
  let httpMock: HttpTestingController;
  const base = environment.apiBaseUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BlobService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(BlobService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => expect(service).toBeTruthy());

  it('should call upload endpoint with FormData', () => {
    const file = new File(['content'], 'test.png', { type: 'image/png' });
    service.uploadImage(file).subscribe();
    const req = httpMock.expectOne(`${base}Blob/Upload`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBe(true);
    req.flush({ url: 'https://example.com/test.png' });
  });

  it('should append file with correct key', () => {
    const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });
    service.uploadImage(file).subscribe();
    const req = httpMock.expectOne(`${base}Blob/Upload`);
    const formData = req.request.body as FormData;
    expect(formData.get('file')).toBeTruthy();
    req.flush({ url: 'https://example.com/photo.jpg' });
  });
});
