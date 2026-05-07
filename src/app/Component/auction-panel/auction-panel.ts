import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuctionService } from '../../Services/AuctionService/auction-service';
import { AddAuction } from '../add-auction/add-auction';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-auction-panel',
  imports: [
    DatePipe, DecimalPipe, MatTableModule, MatButtonModule, MatIconModule,
    MatDialogModule, MatProgressSpinnerModule, MatTooltipModule,
  ],
  templateUrl: './auction-panel.html',
  styleUrl: './auction-panel.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuctionPanel implements OnDestroy {
  private readonly auctionService = inject(AuctionService);
  private readonly dialog = inject(MatDialog);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();

  displayedColumns = ['no', 'auctionName', 'auctionDate', 'startTime', 'endTime', 'baseBudget', 'status', 'actions'];
  auctions: any[] = [];
  isLoading = false;

  ngOnInit(): void { this.loadAuctions(); }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  loadAuctions(): void {
    this.isLoading = true;
    let obj ={
      flag : "GET"
    }
    this.auctionService.get(obj).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => { this.auctions = res; this.isLoading = false; this.cdr.markForCheck(); },
      error: () => { this.isLoading = false; this.cdr.markForCheck(); },
    });
  }

  openAdd(): void {
    this.dialog.open(AddAuction, { data: null, width: '460px' })
      .afterClosed().subscribe(r => { if (r) this.loadAuctions(); });
  }

  openEdit(auction: any): void {
    this.dialog.open(AddAuction, { data: { ...auction, mode: 'edit' }, width: '460px' })
      .afterClosed().subscribe(r => { if (r) this.loadAuctions(); });
  }

  openDelete(auction: any): void {
    this.dialog.open(AddAuction, { data: { ...auction, mode: 'delete' }, width: '380px' })
      .afterClosed().subscribe(r => { if (r) this.loadAuctions(); });
  }
}
