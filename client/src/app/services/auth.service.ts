import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {catchError, tap, throwError} from 'rxjs';
import {DecodedToken, TokenResponse} from '../interfaces/auth.interface';
import {environment} from '../../environments/environment';
import {Router} from '@angular/router';
import {PasswordMatchError} from '../errors/PasswordMatchError';
import {PasswordEmptyError} from '../errors/PasswordEmptyError';
import {InvalidUsernameError} from '../errors/InvalidUsernameError';
import {User} from '../interfaces/user.interface';

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
    if (username.trim() === '' || username.includes(' ')) {
      throw new InvalidUsernameError('Invalid username');
    }
    if (password.trim() === '') {
      throw new PasswordEmptyError('Password empty');
    }
    if (password !== confirmPassword) {
      throw new PasswordMatchError('Passwords do not match');
    }
    return this.http
      .post(`${this.base_url}/auth/registration`, {username, password})
      .pipe(
        catchError((error) => {
          console.log(error);
          if (error.status === 400) {
            console.log(error);
            if (error.error) {
              return throwError(() => new Error(error.error));
            } else {
              return throwError(
                () => new Error('Bad request. Please try again.'),
              );
            }
          } else if (error.status === 500) {
            return throwError(
              () => new Error('Server error. Please try later.'),
            );
          } else {
            return throwError(() => new Error(error.error));
          }
        }),
      );
  }

  login(username: string, password: string) {
    return this.http
      .post<TokenResponse>(
        `${this.base_url}/auth/login`,
        {username, password},
        {withCredentials: true},
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
        `${this.base_url}/auth/refresh-access-token`,
        {},
        {
          withCredentials: true,
        },
      )
      .pipe(
        tap((res) => {
          this.storeTokens(res.accessToken, res.refreshToken);
          const user = this.getDecodedToken() as User;
          localStorage.setItem("user", JSON.stringify(user));
        }),
        catchError((error) => {
          this.router.navigate(['/login']);
          return throwError(() => error);
        }),
      );
  }

  logout() {
    this.http
      .get(this.base_url + '/auth/logout', {
        withCredentials: true,
      })
      .subscribe();
    localStorage.clear();
    this.router.navigate(['/login']);
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
}
