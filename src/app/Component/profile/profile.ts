import { isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProfileService } from '../../Services/Profile/ProfileService';
import { Login } from '../../Services/Login/login';
import { Subject, takeUntil } from 'rxjs';

type ActiveView = 'details' | 'edit' | 'mpin' | 'resetPassword';

@Component({
  selector: 'app-profile',
  imports: [FormsModule, MatProgressSpinnerModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Profile implements OnDestroy {
  private readonly profileService = inject(ProfileService);
  private readonly loginService = inject(Login);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroy$ = new Subject<void>();

  userData: any = null;
  formData: any = {};
  activeView: ActiveView = 'details';
  showDeleteConfirm = false;
  passwordMismatch = false;
  isLoading = false;

  get initials(): string {
    const name: string = this.userData?.name ?? '';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  }

  private getEmail(): string | null {
    return isPlatformBrowser(this.platformId) ? sessionStorage.getItem('email') : null;
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.profileService.getById({ email: this.getEmail() })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => { this.userData = res[0]; this.isLoading = false; this.cdr.markForCheck(); },
        error: () => { this.isLoading = false; this.cdr.markForCheck(); }
      });
  }

  setView(view: ActiveView): void {
    this.formData = view === 'resetPassword'
      ? { newPassword: '', confirmPassword: '' }
      : { ...this.userData };
    this.passwordMismatch = false;
    this.activeView = view;
  }

  cancelView(): void {
    this.activeView = 'details';
    this.passwordMismatch = false;
  }

  saveEdit(): void {
    this.profileService.update(this.formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: () => { this.userData = { ...this.formData }; this.cancelView(); this.cdr.markForCheck(); } });
  }

  saveMpin(): void {
    this.profileService.addMpin({ mpin: this.formData.mpin, email: this.userData?.email })
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: () => this.cancelView() });
  }

  saveResetPassword(): void {
    if (this.formData.newPassword !== this.formData.confirmPassword) {
      this.passwordMismatch = true;
      return;
    }
    this.profileService.resetPassword({
      email: this.userData?.email,
      newPassword: this.formData.newPassword,
    }).pipe(takeUntil(this.destroy$))
      .subscribe({ next: () => this.cancelView() });
  }

  deleteAccount(): void {
    this.profileService.delete({ email: this.userData?.email })
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: () => { this.showDeleteConfirm = false; this.loginService.logout(); } });
  }
}
