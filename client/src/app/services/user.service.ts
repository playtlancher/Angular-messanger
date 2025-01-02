import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { User } from '../interfaces/user.interface';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  http = inject(HttpClient);
  base_url = environment['BASE_URL'];

  constructor() {}

  getUsers(): Observable<{ id: number; username: string }[]> {
    return this.http
      .get<User[]>(`${this.base_url}/users`, { withCredentials: true })
      .pipe(
        map((users) =>
          users.map((user) => ({
            id: user.id,
            username: user.username,
          })),
        ),
      );
  }
}
