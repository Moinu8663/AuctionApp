import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileService } from '../../Services/Profile/ProfileService';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-add-mpin',
  imports: [
        ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './add-mpin.html',
  styleUrl: './add-mpin.css',
})
export class AddMpin {
  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  private dialogRef = inject(MatDialogRef<AddMpin>);

  loading = false;
  error = '';

  mpinForm = this.fb.group({
    email: [''],
    mpin: ['', [Validators.required, Validators.pattern(/^\d{4,6}$/)]]
  });

  submit() {

    if (this.mpinForm.invalid) return;

    this.loading = true;

    this.profileService.addMpin(this.mpinForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Failed to set MPIN';
      }
    });
  }
}
