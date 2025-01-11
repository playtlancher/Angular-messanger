import {Component} from '@angular/core';
import {NgClass} from '@angular/common';
import {ProfileService} from '../../services/profile.service';
import {User} from '../../interfaces/user.interface';
import {getUser} from '../../utilities/GetUser';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-profile',
  imports: [NgClass],
  templateUrl: './profile.component.html',
  standalone: true,
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  animationClass = 'slide-in';
  base_url = environment['BASE_URL'];
  user: User | null = null;
  avatarURL: string = '';
  constructor(
    private readonly profileService: ProfileService,
    private readonly http: HttpClient,
  ) {
    this.user = getUser();
    if(this.user){
      this.avatarURL = `${this.base_url}/users/avatar/${this.user!.id}`;
    }
  }
  async changeAvatar(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const formData = new FormData();
      formData.append('file', input.files[0]);
      this.http
        .post(this.avatarURL, formData, {
          withCredentials: true,
        })
        .subscribe({
          next: () => {
            this.avatarURL = `${this.base_url}/users/avatar/${this.user!.id}?timestamp=${Date.now()}`;
          },
          error: (err) => {
            console.error('Failed to update avatar:', err);
          },
        });
    }
  }
  closeProfile(): void {
    this.animationClass = 'slide-out';
    setTimeout(() => {
      this.profileService.isProfileOpen$.next(false);
    }, 300);
  }
}
