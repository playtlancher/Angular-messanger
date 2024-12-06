import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../data/services/auth.service';
import { inject } from '@angular/core';

export const canActivateAuth: CanActivateFn = (route, state) => {
  const isLoggedIn = inject(AuthService).isAuth();
  if (isLoggedIn) {
    return true;
  }
  return inject(Router).createUrlTree(['/login']);
};
