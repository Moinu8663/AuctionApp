import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { catchError, of } from 'rxjs';
import { TeamService } from '../../Services/TeamService/team-service';

@Component({
  selector: 'app-auction-view',
  imports: [
    DatePipe,
    DecimalPipe,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './auction-view.html',
  styleUrl: './auction-view.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuctionView {
  private readonly teamService = inject(TeamService);
  private readonly cdr = inject(ChangeDetectorRef);

  dialogRef = inject(MatDialogRef<AuctionView>);
  auction = inject<any>(MAT_DIALOG_DATA);

  teams: any[] = [];
  isLoadingTeams = false;

  ngOnInit(): void {
    this.loadTeams();
  }

  loadTeams(): void {
    this.isLoadingTeams = true;

    this.teamService.get({
      flag: 'GET',
      auctionId: this.getAuctionId(this.auction),
      AuctionId: this.getAuctionId(this.auction),
      auctionName: this.auction?.auctionName,
    }).pipe(
      catchError(() => of([]))
    ).subscribe((res) => {
      const teams = this.asArray(res);
      this.teams = teams.filter((team) => this.isAuctionTeam(team));
      this.isLoadingTeams = false;
      this.cdr.markForCheck();
    });
  }

  getTeamId(team: any): number | string {
    return team?.teamId ?? team?.TeamId ?? team?.id ?? team?.teamName ?? '';
  }

  getStatusClass(): string {
    return String(this.auction?.status ?? '').toLowerCase();
  }

  getInitial(value: string | undefined): string {
    return value?.trim()?.[0]?.toUpperCase() || 'A';
  }

  private isAuctionTeam(team: any): boolean {
    const auctionId = this.getAuctionId(this.auction);
    const teamAuctionId = team?.auctionId ?? team?.AuctionId ?? team?.p_auction_id;
    const teamAuctionName = team?.auctionName ?? team?.AuctionName;

    return this.isSameValue(teamAuctionId, auctionId) || this.isSameValue(teamAuctionName, this.auction?.auctionName);
  }

  private getAuctionId(auction: any): number | string {
    return auction?.auctionId ?? auction?.AuctionId ?? auction?.id ?? '';
  }

  private isSameValue(left: any, right: any): boolean {
    return !!left && !!right && String(left).toLowerCase() === String(right).toLowerCase();
  }

  private asArray(value: any): any[] {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.data)) return value.data;
    if (Array.isArray(value?.result)) return value.result;
    if (Array.isArray(value?.items)) return value.items;
    return [];
  }
}
