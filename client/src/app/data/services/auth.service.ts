import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, tap, throwError } from 'rxjs';
import { TokenResponse, DecodedToken } from '../interfaces/auth.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8000';
  private accessToken: string = '';
  private refreshToken: string = '';

  constructor() {
    const storedToken = localStorage.getItem('token');
    const storedRefreshToken = localStorage.getItem('refreshToken');
    if (storedToken) this.accessToken = storedToken;
    if (storedRefreshToken) this.refreshToken = storedRefreshToken;
  }

  register(username: string, password: string, confirmPassword: string) {
    return this.http.post(`${this.apiUrl}/registration`, {
      username,
      password,
      confirmPassword,
    });
  }

  login(username: string, password: string) {
    return this.http
      .post<TokenResponse>(
        `${this.apiUrl}/login`,
        { username, password },
        { withCredentials: true },
      )
      .pipe(
        tap((res) => this.storeTokens(res.access_token, res.refresh_token)),
        catchError((error) => {
          console.error('Login failed:', error);
          return throwError(() => error);
        }),
      );
  }

  logout() {
    this.clearTokens();
  }

  refreshAccessToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    if (!this.refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http
      .post<TokenResponse>(
        `${this.apiUrl}/refresh-token`,
        {},
        {
          withCredentials: true,
        },
      )
      .pipe(
        tap((res) => {
          this.storeTokens(res.access_token, res.refresh_token);
        }),
        catchError((error) => {
          console.error('Failed to refresh token:', error);
          this.logout();
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

  getDecodedToken(): DecodedToken {
    const token = this.accessToken;
    return this.decodeJWT(token);
  }

  getToken() {
    return this.accessToken;
  }

  private decodeJWT(token: string): DecodedToken {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
  }

  isAuth() {
    return !!this.accessToken;
  }
}
