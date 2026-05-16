import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PlayerService } from '../../Services/PlayerService/player-service';
import { AuctionService } from '../../Services/AuctionService/auction-service';
import { TeamService } from '../../Services/TeamService/team-service';
import { BlobService } from '../../Services/BlobService/blob-service';

@Component({
  selector: 'app-add-player',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatSelectModule, MatProgressSpinnerModule, MatDialogModule,
  ],
  templateUrl: './add-player.html',
  styleUrl: './add-player.css',
})
export class AddPlayer implements OnInit {
  private readonly fb             = inject(FormBuilder);
  private readonly playerService  = inject(PlayerService);
  private readonly auctionService = inject(AuctionService);
  private readonly teamService    = inject(TeamService);
  private readonly blobService    = inject(BlobService);
  private readonly platformId     = inject(PLATFORM_ID);

  dialogRef  = inject(MatDialogRef<AddPlayer>, { optional: true });
  dialogData = inject<any>(MAT_DIALOG_DATA, { optional: true });

  isEdit   = this.dialogData?.mode === 'edit';
  isDelete = this.dialogData?.mode === 'delete';

  loading     = false;
  uploading   = false;
  errorMsg    = '';
  picPreview  = this.dialogData?.picUrl ?? '';
  selectedFile: File | null = null;

  auctions: any[] = [];
  teams:    any[] = [];

  compareById = (a: any, b: any): boolean => +a === +b;

  private get createdBy(): string {
    return isPlatformBrowser(this.platformId) ? (sessionStorage.getItem('email') ?? '') : '';
  }

  form = this.fb.group({
    playerName: [this.dialogData?.playerName ?? '', [Validators.required, Validators.minLength(2)]],
    picUrl:     [this.dialogData?.picUrl     ?? ''],
    age:        [this.dialogData?.age        ?? null, [Validators.required, Validators.min(10), Validators.max(60)]],
    mobile:     [this.dialogData?.mobile     ?? '', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    email:      [this.dialogData?.email      ?? '', [Validators.required, Validators.email]],
    country:    [this.dialogData?.country    ?? '', Validators.required],
    role:       [this.dialogData?.role       ?? '', Validators.required],
    basePrice:  [this.dialogData?.basePrice  ?? null, [Validators.required, Validators.min(1)]],
    auctionId:  [this.dialogData?.auctionId  ? +this.dialogData.auctionId : null, Validators.required],
    teamId:     [this.dialogData?.teamId     ? +this.dialogData.teamId    : null],
  });

  get f() { return this.form.controls; }

  getInitial(value: string | undefined): string {
    return value?.trim()?.[0]?.toUpperCase() || 'P';
  }

  ngOnInit(): void {
    this.auctionService.get({ flag: 'GET' }).subscribe({
      next: (res) => { this.auctions = res; }
    });
    this.teamService.get({ flag: 'GET' }).subscribe({
      next: (res) => { this.teams = Array.isArray(res) ? res : []; }
    });
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.selectedFile = input.files[0];
    this.picPreview = URL.createObjectURL(this.selectedFile);
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
          this.form.patchValue({ picUrl: res.url ?? res });
          this.savePlayer();
        },
        error: (err) => {
          this.uploading = false;
          this.loading = false;
          this.errorMsg = err?.error?.message || 'Image upload failed.';
        },
      });
    } else {
      this.savePlayer();
    }
  }

  private savePlayer(): void {
    const payload = { ...this.form.getRawValue(), created_By: this.createdBy };
    const api$ = this.isEdit
      ? this.playerService.update({ ...payload, id: this.dialogData.id })
      : this.playerService.create(payload);
    api$.subscribe({
      next: () => { this.loading = false; this.dialogRef?.close(true); },
      error: (err) => { this.loading = false; this.errorMsg = err?.error?.message || 'Operation failed.'; },
    });
  }

  onDelete(): void {
    this.loading = true;
    this.playerService.delete({ id: this.dialogData.id }).subscribe({
      next: () => { this.loading = false; this.dialogRef?.close(true); },
      error: (err) => { this.loading = false; this.errorMsg = err?.error?.message || 'Delete failed.'; },
    });
  }
}
