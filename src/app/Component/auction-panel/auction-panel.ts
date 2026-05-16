import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuctionService } from '../../Services/AuctionService/auction-service';
import { AddAuction } from '../add-auction/add-auction';
import { Subject, takeUntil } from 'rxjs';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { AuctionView } from '../auction-view/auction-view';


@Component({
  selector: 'app-auction-panel',
  imports: [
    DatePipe, DecimalPipe, MatTableModule, MatButtonModule, MatIconModule,
    MatDialogModule, MatProgressSpinnerModule, MatTooltipModule,MatPaginatorModule
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

  @ViewChild(MatPaginator) paginator!: MatPaginator;


  displayedColumns = ['no', 'auctionName', 'auctionDate', 'startTime', 'endTime', 'baseBudget', 'status','description','createdBy', 'createdAt', 'updatedBy', 'updatedAt', 'actions'];
  dataSource = new MatTableDataSource<any>([]);

  isLoading = false;

  ngOnInit(): void {
    this.loadAuctions();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  loadAuctions(): void {
    this.isLoading = true;
    let obj ={
      flag : "GET"
    }
    this.auctionService.get(obj).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => { 
          this.dataSource.data = res;
          this.isLoading = false;

          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
          }

        this.cdr.markForCheck(); 
      },
      error: () => { this.isLoading = false; this.cdr.markForCheck(); },
    });
  }

  openAdd(): void {
    this.dialog.open(AddAuction, {
      data: null,
      width: '720px',
      maxWidth: '95vw',
    })
      .afterClosed().subscribe(r => { if (r) this.loadAuctions(); });
  }

  openEdit(auction: any): void {
    this.dialog.open(AddAuction, {
      data: { ...auction, mode: 'edit' },
      width: '720px',
      maxWidth: '95vw',
    })
      .afterClosed().subscribe(r => { if (r) this.loadAuctions(); });
  }

  openView(auction: any): void {
    this.dialog.open(AuctionView, {
      data: auction,
      width: '760px',
      maxWidth: '95vw',
    });
  }

  openDelete(auction: any): void {
    this.dialog.open(AddAuction, { data: { ...auction, mode: 'delete' }, width: '380px' })
      .afterClosed().subscribe(r => { if (r) this.loadAuctions(); });
  }
}
