import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Login } from '../Login/login';

export const roleGuard: CanActivateFn = (route, state) => {
const auth = inject(Login);
  const router = inject(Router);

  const expectedRoles = route.data?.['roles'] as string[];
  const userRole = auth.getRole();

  if (userRole && expectedRoles.includes(userRole)) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }

};
