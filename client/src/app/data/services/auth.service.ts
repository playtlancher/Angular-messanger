import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, tap, throwError } from 'rxjs';
import { DecodedToken, TokenResponse } from '../interfaces/auth.interface';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly base_url = environment['BASE_URL'];
  private accessToken: string = '';
  private refreshToken: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    const storedToken = localStorage.getItem('token');
    const storedRefreshToken = localStorage.getItem('refreshToken');
    if (storedToken) this.accessToken = storedToken;
    if (storedRefreshToken) this.refreshToken = storedRefreshToken;
  }

  register(username: string, password: string, confirmPassword: string) {
    return this.http.post(`${this.base_url}/registration`, {
      username,
      password,
      confirmPassword,
    });
  }

  login(username: string, password: string) {
    return this.http
      .post<TokenResponse>(
        `${this.base_url}/login`,
        { username, password },
        { withCredentials: true },
      )
      .pipe(
        tap((res) => this.storeTokens(res.accessToken, res.refreshToken)),
        catchError((error) => {
          console.error('Login failed:', error);
          return throwError(() => error);
        }),
      );
  }

  refreshAccessToken() {
    if (!this.refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }
    this.clearTokens();
    return this.http
      .post<TokenResponse>(
        `${this.base_url}/refresh-access-token`,
        {},
        {
          withCredentials: true,
        },
      )
      .pipe(
        tap((res) => {
          this.storeTokens(res.accessToken, res.refreshToken);
        }),
        catchError((error) => {
          this.router.navigate(['/login']);
          return throwError(() => error);
        }),
      );
  }

  private storeTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  private clearTokens() {
    this.accessToken = '';
    this.refreshToken = '';
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }

  getDecodedToken(): DecodedToken | null {
    if (!this.accessToken) return null;
    return this.decodeJWT(this.accessToken);
  }

  private decodeJWT(token: string): DecodedToken {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
  }

  isAuth() {
    return !!this.accessToken;
  }
  getUserId(): number | null {
    const decoded = this.getDecodedToken();
    return decoded ? decoded.id : null;
  }
}
