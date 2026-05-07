import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TeamService } from '../../Services/TeamService/team-service';
import { BlobService } from '../../Services/BlobService/blob-service';
import { AuctionService } from '../../Services/AuctionService/auction-service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-add-team',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatSelectModule, MatProgressSpinnerModule, MatDialogModule,
  ],
  templateUrl: './add-team.html',
  styleUrl: './add-team.css',
})
export class AddTeam implements OnInit {
  private readonly fb             = inject(FormBuilder);
  private readonly teamService    = inject(TeamService);
  private readonly blobService    = inject(BlobService);
  private readonly auctionService = inject(AuctionService);
  private readonly platformId = inject(PLATFORM_ID);

  dialogRef  = inject(MatDialogRef<AddTeam>, { optional: true });
  dialogData = inject<any>(MAT_DIALOG_DATA, { optional: true });

  isEdit   = this.dialogData?.mode === 'edit';
  isDelete = this.dialogData?.mode === 'delete';

  loading     = false;
  uploading   = false;
  errorMsg    = '';
  logoPreview = this.dialogData?.logoUrl ?? '';
  selectedFile: File | null = null;
  auctions: any[] = [];

  compareById = (a: any, b: any): boolean => +a === +b;

  form = this.fb.group({
    auctionId: [this.dialogData?.auctionId ? +this.dialogData.auctionId : null, Validators.required],
    teamName:  [this.dialogData?.teamName  ?? '', [Validators.required, Validators.minLength(2)]],
    ownerName: [this.dialogData?.ownerName ?? '', [Validators.required, Validators.minLength(5)]],
    purse:     [this.dialogData?.purse     ?? '', [Validators.required, Validators.min(1)]],
    logoUrl:   [this.dialogData?.logoUrl   ?? ''],
  });

  get f() { return this.form.controls; }
    private get createdBy(): string {
    return isPlatformBrowser(this.platformId) ? (sessionStorage.getItem('email') ?? '') : '';
  }

  ngOnInit(): void {
    this.auctionService.get({ flag: 'GET' }).subscribe({
      next: (res) => {
        this.auctions = res;
        if (this.isEdit && this.dialogData?.auctionId) {
          this.form.patchValue({ auctionId: this.dialogData.auctionId });
        }
      },
    });
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.selectedFile = input.files[0];
    this.logoPreview = URL.createObjectURL(this.selectedFile);
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMsg = '';

    if (this.selectedFile) {
      this.uploading = true;
      this.blobService.uploadImage(this.selectedFile).subscribe({
        next: (res) => {
          this.uploading = false;
          this.form.patchValue({ logoUrl: res.url ?? res });
          this.saveTeam();
        },
        error: (err) => {
          this.uploading = false;
          this.loading = false;
          this.errorMsg = err?.error?.message || 'Image upload failed.';
        },
      });
    } else {
      this.saveTeam();
    }
  }

  private saveTeam(): void {
    const api$ = this.isEdit
      ? this.teamService.update({ ...this.form.getRawValue(), id: this.dialogData.id, created_By: this.createdBy})
      : this.teamService.create({...this.form.getRawValue(),created_By: this.createdBy});
    api$.subscribe({
      next: () => { this.loading = false; this.dialogRef?.close(true); },
      error: (err) => { this.loading = false; this.errorMsg = err?.error?.message || 'Operation failed.'; },
    });
  }

  onDelete(): void {
    this.loading = true;
    this.teamService.delete({ id: this.dialogData.id }).subscribe({
      next: () => { this.loading = false; this.dialogRef?.close(true); },
      error: (err) => { this.loading = false; this.errorMsg = err?.error?.message || 'Delete failed.'; },
    });
  }
}
