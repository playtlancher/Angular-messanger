import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, switchMap, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { User } from '../interfaces/user.interface';

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  localStorage.setItem(
    'user',
    JSON.stringify(authService.getDecodedToken() as User),
  );
  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401 || error.status === 0) {
        return refresh(authService).pipe(
          switchMap(() => next(req)),
          catchError((refreshError) => {
            console.error('Failed to refresh token');
            return throwError(() => refreshError);
          }),
        );
      }
      return throwError(() => error);
    }),
  );
};

const refresh = (authService: AuthService) => {
  console.log('Refreshing token...');
  return authService.refreshAccessToken();
};
