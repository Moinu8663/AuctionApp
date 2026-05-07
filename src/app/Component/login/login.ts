import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Login as LoginService } from '../../Services/Login/login';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTabsModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private fb = inject(FormBuilder);
  private loginService = inject(LoginService);
  private router = inject(Router);

  loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });
    loginMpinForm = this.fb.group({
    mpin: ['', Validators.required],
  });

  errorMsg = '';
  loading = false;
  hidePassword = signal(true);

  onTabChange(): void {
    this.errorMsg = '';
  }

 ngOnInit() {
      if (typeof window !== 'undefined') {
    this.loginService.checkSession();
  }


    // if already logged in → redirect
    if (this.loginService.isLoggedIn()) {
      this.router.navigate(['/home']);
    }
  }

  // ✅ SUBMIT LOGIN
  onSubmit() {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.errorMsg = '';

    const obj = {
      email: this.loginForm.value.username,
      password: this.loginForm.value.password,
    };

    this.loginService.login(obj).subscribe({
      next: () => {
        this.loading = false;
        this.loginForm.reset();

        // ✅ navigate after success
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.loading = false;

        // ✅ better error handling
        if (err.status === 401) {
          this.errorMsg = 'Invalid email or password';
        } else if (err.status === 0) {
          this.errorMsg = 'Server not reachable';
        } else {
          this.errorMsg = err?.error?.message || 'Login failed. Please try again.';
        }
      },
    });
  }

    onSubmitMpin() {
    if (this.loginMpinForm.invalid) return;

    this.loading = true;
    this.errorMsg = '';

    const obj = {
      mpin: this.loginMpinForm.value.mpin
    };

    this.loginService.loginMpin(obj).subscribe({
      next: () => {
        this.loading = false;
        this.loginMpinForm.reset();

        // ✅ navigate after success
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.loading = false;

        // ✅ better error handling
        if (err.status === 401) {
          this.errorMsg = 'Invalid Mpin';
        } else if (err.status === 0) {
          this.errorMsg = 'Server not reachable';
        } else {
          this.errorMsg = err?.error?.message || 'Login failed. Please try again.';
        }
      },
    });
  }

  // ✅ TOGGLE PASSWORD VISIBILITY
  togglePassword() {
    this.hidePassword.set(!this.hidePassword());
  }
}
