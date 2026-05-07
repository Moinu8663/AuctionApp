import { DecimalPipe } from '@angular/common';
import { Component, inject, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PlayerService } from '../../Services/PlayerService/player-service';
import { AddPlayer } from '../add-player/add-player';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-player-panel',
  imports: [
    DecimalPipe, MatTableModule, MatButtonModule, MatIconModule,
    MatDialogModule, MatProgressSpinnerModule, MatTooltipModule,
  ],
  templateUrl: './player-panel.html',
  styleUrl: './player-panel.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerPanel implements OnDestroy {
  private readonly playerService = inject(PlayerService);
  private readonly dialog = inject(MatDialog);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();

  displayedColumns = ['no', 'playerName', 'picUrl', 'role', 'country', 'age', 'mobile', 'email', 'basePrice', 'auctionId', 'teamId', 'actions'];
  players: any[] = [];
  isLoading = false;

  ngOnInit(): void { this.loadPlayers(); }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  loadPlayers(): void {
    this.isLoading = true;
    this.playerService.get({flag : "GET"}).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => { this.players = res; this.isLoading = false; this.cdr.markForCheck(); },
      error: () => { this.isLoading = false; this.cdr.markForCheck(); },
    });
  }

  openAdd(): void {
    this.dialog.open(AddPlayer, { data: null, width: '460px' })
      .afterClosed().subscribe(r => { if (r) this.loadPlayers(); });
  }

  openEdit(player: any): void {
    this.dialog.open(AddPlayer, { data: { ...player, mode: 'edit' }, width: '460px' })
      .afterClosed().subscribe(r => { if (r) this.loadPlayers(); });
  }

  openDelete(player: any): void {
    this.dialog.open(AddPlayer, { data: { ...player, mode: 'delete' }, width: '380px' })
      .afterClosed().subscribe(r => { if (r) this.loadPlayers(); });
  }
}
