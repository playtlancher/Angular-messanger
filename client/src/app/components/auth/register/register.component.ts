import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { InvalidUsernameError } from '../../../errors/InvalidUsernameError';
import { PasswordEmptyError } from '../../../errors/PasswordEmptyError';
import { PasswordMatchError } from '../../../errors/PasswordMatchError';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, NgIf, RouterLink],
  templateUrl: './register.component.html',
  standalone: true,
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  registrationError: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  registrationForm = new FormGroup({
    username: new FormControl<string | null>(null, Validators.required),
    password: new FormControl<string | null>(null, Validators.required),
    confirmPassword: new FormControl<string | null>(null, Validators.required),
  });

  onSubmit() {
    this.registrationError = null;
    if (!this.registrationForm.valid) {
      console.error('Form is not valid.');
      return;
    }

    const username: string = this.registrationForm.value.username || '';
    const password: string = this.registrationForm.value.password || '';
    const confirmPassword: string =
      this.registrationForm.value.confirmPassword || '';

    this.authService.register(username, password, confirmPassword).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (e) => {
        switch (true) {
          case e instanceof InvalidUsernameError: {
            this.registrationError =
              'Username must not be empty and contain spaces';
            break;
          }
          case e instanceof PasswordEmptyError: {
            this.registrationError = 'Password must not be empty';
            break;
          }
          case e instanceof PasswordMatchError: {
            this.registrationError = 'Passwords must match';
            break;
          }
          default: {
            const error = e as Error;
            this.registrationError = error.message;
          }
        }
        console.error('Registration error:', e);
      },
    });
  }
}
