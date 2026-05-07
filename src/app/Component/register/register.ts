import { Component, inject, signal, Optional } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProfileService } from '../../Services/Profile/ProfileService';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return password && confirm && password !== confirm ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    NgTemplateOutlet,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatDialogModule,
  ],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private readonly fb = inject(FormBuilder);
  private readonly profileService = inject(ProfileService);

  @Optional() dialogRef = inject(MatDialogRef<Register>, { optional: true });
  @Optional() dialogData = inject<any>(MAT_DIALOG_DATA, { optional: true });

  isDialog = !!this.dialogRef;
  isEdit = this.dialogData?.mode === 'edit';
  isDelete = this.dialogData?.mode === 'delete';

  hidePassword = signal(true);
  hideConfirm = signal(true);
  loading = false;
  errorMsg = '';
  successMsg = '';

  registerForm = this.fb.group({
    name:            [this.dialogData?.name   ?? '', [Validators.required, Validators.minLength(3)]],
    email:           [{ value: this.dialogData?.email ?? '', disabled: this.isEdit }, [Validators.required, Validators.email]],
    mobile:          [this.dialogData?.mobile ?? '', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    role:            [this.dialogData?.role   ?? '', Validators.required],
    password:        [{ value: '', disabled: this.isEdit }, this.isEdit ? [] : [Validators.required, Validators.minLength(8)]],
    confirmPassword: [{ value: '', disabled: this.isEdit }, this.isEdit ? [] : [Validators.required]],
  }, { validators: passwordMatchValidator });

  get f() { return this.registerForm.controls; }

  onDelete(): void {
    this.loading = true;
    this.profileService.delete({ email: this.dialogData.email }).subscribe({
      next: () => { this.loading = false; this.dialogRef!.close(true); },
      error: (err) => { this.loading = false; this.errorMsg = err?.error?.message || 'Delete failed.'; },
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';

    const value = this.registerForm.getRawValue();

    const api$ = this.isEdit
      ? this.profileService.update({ name: value.name, mobile: value.mobile, role: value.role, email: this.dialogData.email })
      : this.profileService.create({ name: value.name, email: value.email, mobile: value.mobile, role: value.role, password: value.password });

    api$.subscribe({
      next: () => {
        this.loading = false;
        if (this.isDialog) {
          this.dialogRef!.close(true);
        } else {
          this.successMsg = 'Registration successful!';
          this.registerForm.reset();
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'Operation failed. Please try again.';
      },
    });
  }
}
