import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Login } from '../Login/login';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
const platformId = inject(PLATFORM_ID);
  const auth = inject(Login);

  const isBrowser = isPlatformBrowser(platformId);

  // ✅ SSR safe check
  if (!isBrowser) {
    return true; // allow SSR rendering
  }

  if (auth.isLoggedIn()) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};
