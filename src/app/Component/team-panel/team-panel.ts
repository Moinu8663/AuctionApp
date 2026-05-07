import { DecimalPipe } from '@angular/common';
import { Component, inject, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TeamService } from '../../Services/TeamService/team-service';
import { AddTeam } from '../add-team/add-team';
import { Subject, takeUntil } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { STATUS_CODES } from 'http';

@Component({
  selector: 'app-team-panel',
  imports: [
    DecimalPipe,
    MatTableModule, MatButtonModule, MatIconModule,
    MatDialogModule, MatProgressSpinnerModule, MatTooltipModule,
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

  displayedColumns = ['no', 'teamName', 'ownerName', 'logoUrl', 'auctionId', 'purse', 'createdBy', 'createdAt', 'updatedBy', 'updatedAt', 'actions'];
  teams: any[] = [];
  isLoading = false;

  ngOnInit(): void { this.loadTeams(); }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  loadTeams(): void {
    this.isLoading = true;
        let obj ={
  flag: "GET"
}
    this.teamService.get(obj).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => { 
        if(res != "teams not found" ){
          this.teams = res; this.isLoading = false; this.cdr.markForCheck();
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
    this.dialog.open(AddTeam, { data: null, width: '460px' })
      .afterClosed().subscribe(result => { if (result) this.loadTeams(); });
  }

  openEdit(team: any): void {
    this.dialog.open(AddTeam, { data: { ...team, mode: 'edit' }, width: '460px' })
      .afterClosed().subscribe(result => { if (result) this.loadTeams(); });
  }

  openDelete(team: any): void {
    this.dialog.open(AddTeam, { data: { ...team, mode: 'delete' }, width: '380px' })
      .afterClosed().subscribe(result => { if (result) this.loadTeams(); });
  }
}
