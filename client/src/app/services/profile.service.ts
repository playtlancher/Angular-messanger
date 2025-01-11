import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  isProfileOpen$ = new BehaviorSubject<boolean>(false);

  constructor(private readonly http: HttpClient) {}
}
