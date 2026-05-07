import { Component, inject, PLATFORM_ID } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgTemplateOutlet, isPlatformBrowser } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuctionService } from '../../Services/AuctionService/auction-service';

@Component({
  selector: 'app-add-auction',
  imports: [
    ReactiveFormsModule, NgTemplateOutlet,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatSelectModule, MatProgressSpinnerModule, MatDialogModule,
  ],
  templateUrl: './add-auction.html',
  styleUrl: './add-auction.css',
})
export class AddAuction {
  private readonly fb = inject(FormBuilder);
  private readonly auctionService = inject(AuctionService);
  private readonly platformId = inject(PLATFORM_ID);

  private get createdBy(): string {
    return isPlatformBrowser(this.platformId) ? (sessionStorage.getItem('email') ?? '') : '';
  }

  dialogRef  = inject(MatDialogRef<AddAuction>, { optional: true });
  dialogData = inject<any>(MAT_DIALOG_DATA, { optional: true });

  isEdit   = this.dialogData?.mode === 'edit';
  isDelete = this.dialogData?.mode === 'delete';
  loading  = false;
  errorMsg = '';

  form = this.fb.group({
    auctionName: [this.dialogData?.auctionName ?? '', [Validators.required, Validators.minLength(3)]],
    auctionDate: [this.dialogData?.auctionDate ?? '', Validators.required],
    startTime:   [this.dialogData?.startTime   ?? '', Validators.required],
    endTime:     [this.dialogData?.endTime     ?? '', Validators.required],
    baseBudget:  [this.dialogData?.baseBudget  ?? '', Validators.required],
    status:      [this.dialogData?.status      ?? 'Upcoming', Validators.required],
    description: [this.dialogData?.description ?? '', Validators.required],
  });

  timeSlots: string[] = this.generateTimeSlots();

  private generateTimeSlots(): string[] {
    const slots: string[] = [];
    for (let h = 0; h < 24; h++) {
      for (const m of [0, 30]) {
        const hh = h.toString().padStart(2, '0');
        const mm = m.toString().padStart(2, '0');
        const suffix = h < 12 ? 'AM' : 'PM';
        const displayH = h % 12 === 0 ? 12 : h % 12;
        slots.push(`${hh}:${mm} (${displayH}:${mm} ${suffix})`);
      }
    }
    return slots;
  }

  get f() { return this.form.controls; }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMsg = '';
    const api$ = this.isEdit
      ? this.auctionService.update({ ...this.form.getRawValue(), auctionId: this.dialogData.auctionId, created_By: this.createdBy })
      : this.auctionService.create({ ...this.form.getRawValue(), created_By: this.createdBy });
    api$.subscribe({
      next: () => { this.loading = false; this.dialogRef?.close(true); },
      error: (err) => { this.loading = false; this.errorMsg = err?.error?.message || 'Operation failed.'; },
    });
  }

  onDelete(): void {
    this.loading = true;
    this.auctionService.delete({ id: this.dialogData.id }).subscribe({
      next: () => { this.loading = false; this.dialogRef?.close(true); },
      error: (err) => { this.loading = false; this.errorMsg = err?.error?.message || 'Delete failed.'; },
    });
  }
}
