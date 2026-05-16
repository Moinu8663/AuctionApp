import { DecimalPipe } from '@angular/common';
import { Component, inject, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TeamService } from '../../Services/TeamService/team-service';
import { AddTeam } from '../add-team/add-team';
import { Subject, takeUntil } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { TeamView } from '../team-view/team-view';


@Component({
  selector: 'app-team-panel',
  imports: [
    MatTableModule, MatButtonModule, MatIconModule,
    MatDialogModule, MatProgressSpinnerModule, MatTooltipModule,MatPaginatorModule
  ],
  templateUrl: './team-panel.html',
  styleUrl: './team-panel.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamPanel implements OnDestroy {
  private readonly teamService = inject(TeamService);
  private readonly dialog = inject(MatDialog);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();
  private readonly snckbar = inject(MatSnackBar);

  @ViewChild(MatPaginator) paginator!: MatPaginator;


  displayedColumns = ['no', 'teamName', 'ownerName', 'logoUrl', 'auctionName', 'purse', 'createdBy', 'createdAt', 'updatedBy', 'updatedAt', 'actions'];
  dataSource = new MatTableDataSource<any>([]);

  isLoading = false;

  ngOnInit(): void {
    this.loadTeams();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  loadTeams(): void {
    this.isLoading = true;
        let obj ={
  flag: "GET"
}
    this.teamService.get(obj).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => { 
        if(res != "teams not found" ){
          this.dataSource.data = res;
          this.isLoading = false;

          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
          }

            this.cdr.markForCheck();
        }
        else{
          this.snckbar.open(res, 'ok',{
            duration:2000
          })
          this.isLoading = false;
        }
         },
      error: () => { this.isLoading = false; this.cdr.markForCheck(); },
    });
  }

  openAdd(): void {
    this.dialog.open(AddTeam, { data: null, width: '720px', maxWidth: '95vw' })
      .afterClosed().subscribe(result => { if (result) this.loadTeams(); });
  }

  openEdit(team: any): void {
    this.dialog.open(AddTeam, { data: { ...team, mode: 'edit' }, width: '720px', maxWidth: '95vw' })
      .afterClosed().subscribe(result => { if (result) this.loadTeams(); });
  }

  openView(team: any): void {
    this.dialog.open(TeamView, {
      data: team,
      width: '680px',
      maxWidth: '95vw',
    });
  }

  openDelete(team: any): void {
    this.dialog.open(AddTeam, { data: { ...team, mode: 'delete' }, width: '380px' })
      .afterClosed().subscribe(result => { if (result) this.loadTeams(); });
  }
}
