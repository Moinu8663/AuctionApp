import { Component, inject, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProfileService } from '../../Services/Profile/ProfileService';
import { Register } from '../register/register';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-admin-panel',
  imports: [
    MatTableModule, MatButtonModule, MatIconModule,
    MatDialogModule, MatProgressSpinnerModule, MatTooltipModule,
  ],
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPanel implements OnDestroy {
  private readonly profileService = inject(ProfileService);
  private readonly dialog = inject(MatDialog);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();

  displayedColumns = ['no', 'name', 'email', 'mobile', 'role', 'actions'];
  admins: any[] = [];
  isLoading = false;

  ngOnInit(): void { this.loadAdmins(); }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  loadAdmins(): void {
    this.isLoading = true;
    let obj ={
  "flag": "GET"
}
    this.profileService.get(obj).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => { this.admins = res; this.isLoading = false; this.cdr.markForCheck(); },
      error: () => { this.isLoading = false; this.cdr.markForCheck(); },
    });
  }

  openRegister(): void {
    this.dialog.open(Register, { data: null, width: '460px' })
      .afterClosed().subscribe(result => { if (result) this.loadAdmins(); });
  }

  openEdit(admin: any): void {
    this.dialog.open(Register, { data: { ...admin, mode: 'edit' }, width: '460px' })
      .afterClosed().subscribe(result => { if (result) this.loadAdmins(); });
  }

  openDelete(admin: any): void {
    this.dialog.open(Register, { data: { ...admin, mode: 'delete' }, width: '380px' })
      .afterClosed().subscribe(result => { if (result) this.loadAdmins(); });
  }
}
