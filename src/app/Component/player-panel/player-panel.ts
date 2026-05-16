import { DecimalPipe } from '@angular/common';
import { Component, inject, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PlayerService } from '../../Services/PlayerService/player-service';
import { AddPlayer } from '../add-player/add-player';
import { Subject, takeUntil } from 'rxjs';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { PlayerView } from '../player-view/player-view';

@Component({
  selector: 'app-player-panel',
  imports: [
    DecimalPipe, MatTableModule, MatButtonModule, MatIconModule,
    MatDialogModule, MatProgressSpinnerModule, MatTooltipModule,MatPaginatorModule
  ],
  templateUrl: './player-panel.html',
  styleUrl: './player-panel.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerPanel implements OnDestroy, AfterViewInit {
  private readonly playerService = inject(PlayerService);
  private readonly dialog = inject(MatDialog);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();
    @ViewChild(MatPaginator) paginator!: MatPaginator;


  displayedColumns = ['no', 'playerName', 'picUrl', 'role', 'country', 'age', 'mobile', 'email', 'basePrice','soldPrice','isSold', 'auctionName', 'teamName','createdBy', 'createdAt', 'updatedBy', 'updatedAt', 'actions'];
  dataSource = new MatTableDataSource<any>([]);

  isLoading = false;

  ngOnInit(): void {
    this.loadPlayers();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  loadPlayers(): void {
    this.isLoading = true;
    this.playerService.get({flag : "GET"}).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        this.dataSource.data = res;
        this.isLoading = false;

        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
        }
        this.cdr.markForCheck(); },
      error: () => { this.isLoading = false; this.cdr.markForCheck(); },
    });
  }

  openAdd(): void {
    this.dialog.open(AddPlayer, { data: null, width: '760px', maxWidth: '95vw' })
      .afterClosed().subscribe(r => { if (r) this.loadPlayers(); });
  }

  openEdit(player: any): void {
    this.dialog.open(AddPlayer, { data: { ...player, mode: 'edit' }, width: '760px', maxWidth: '95vw' })
      .afterClosed().subscribe(r => { if (r) this.loadPlayers(); });
  }

  openView(player: any): void {
    this.dialog.open(PlayerView, {
      data: player,
      width: '760px',
      maxWidth: '95vw',
    });
  }

  openDelete(player: any): void {
    this.dialog.open(AddPlayer, { data: { ...player, mode: 'delete' }, width: '380px' })
      .afterClosed().subscribe(r => { if (r) this.loadPlayers(); });
  }
}
