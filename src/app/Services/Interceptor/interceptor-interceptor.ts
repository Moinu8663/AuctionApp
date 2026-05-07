import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Crypto } from '../DecodeService/crypto';
import { map } from 'rxjs';

export const interceptorInterceptor: HttpInterceptorFn = (req, next) => {
  const crypto = inject(Crypto);
  const platformId = inject(PLATFORM_ID);

  const token = isPlatformBrowser(platformId)
    ? sessionStorage.getItem('token')
    : null;

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

 const skipUrls = [
  '/api/Crypto/encrypt',
  '/api/Crypto/decrypt',
];

const shouldSkip =
  req.method === 'GET' ||
  !req.body ||
  skipUrls.some(url => req.url.includes(url));

if (shouldSkip) {
  return next(req);
}

  // =========================
  // 🔒 Encrypt Request
  // =========================
  let modifiedRequest: typeof req;

  if (req.body instanceof FormData) {
    const encryptedForm = new FormData();
    req.body.forEach((value, key) => {
      if (value instanceof File) {
        encryptedForm.append(key, value, value.name);
      } else {
        encryptedForm.append(key, crypto.doubleEncrypt(value));
      }
    });
    modifiedRequest = req.clone({ body: encryptedForm });
  } else {
    modifiedRequest = req.clone({ body: { data: crypto.doubleEncrypt(req.body) } });
  }

  return next(modifiedRequest).pipe(

    map((event) => {

      // =========================
      // 🔓 Decrypt Response
      // =========================
      if (event instanceof HttpResponse && event.body) {

        try {
          const body = event.body as any;

          const decrypted = crypto.doubleDecrypt<any>(body.data);

          return event.clone({
            body: decrypted
          });

        } catch (error) {
          console.error('❌ Decryption failed:', error);
          return event;
        }
      }

      return event;
    })

  );
};
