import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../data/services/auth.service';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, NgIf, RouterLink],
  templateUrl: './register.component.html',
  standalone: true,
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  authService = inject(AuthService);
  registrationError: string | null = null;
  passwordMismatch: boolean = false;

  registrationForm = new FormGroup({
    username: new FormControl<string | null>(null, Validators.required),
    password: new FormControl<string | null>(null, Validators.required),
    confirmPassword: new FormControl<string | null>(null, Validators.required),
  });

  onSubmit() {
    this.registrationError = null;
    this.passwordMismatch = false;

    if (!this.registrationForm.valid) {
      console.error('Form is not valid.');
      return;
    }

    const username: string = this.registrationForm.value.username || '';
    const password: string = this.registrationForm.value.password || '';
    const confirmPassword: string =
      this.registrationForm.value.confirmPassword || '';

    if (password !== confirmPassword) {
      this.registrationError = 'Passwords do not match.';
      return;
    }

    this.authService.register(username, password, confirmPassword).subscribe({
      next: (response) => console.log(response),
      error: (err) => {
        this.registrationError = err.error.message;
      },
    });
  }
}
