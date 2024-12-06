import {
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { catchError, switchMap, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { AuthService } from '../data/services/auth.service';

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401) {
        return refresh(authService).pipe(
          switchMap(() => next(req)),
          catchError((refreshError) => {
            console.error('Failed to refresh token:', refreshError);
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
