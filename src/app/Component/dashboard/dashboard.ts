import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';
import { AuctionService } from '../../Services/AuctionService/auction-service';
import { PlayerService } from '../../Services/PlayerService/player-service';
import { TeamService } from '../../Services/TeamService/team-service';

interface TeamSummary {
  team: any;
  purse: number;
  spent: number;
  remaining: number;
  boughtCount: number;
}

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, DecimalPipe, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  private readonly auctionService = inject(AuctionService);
  private readonly teamService = inject(TeamService);
  private readonly playerService = inject(PlayerService);
  private readonly cdr = inject(ChangeDetectorRef);

  auctions: any[] = [];
  teams: any[] = [];
  players: any[] = [];
  selectedAuctionId: number | string = '';
  isLoading = false;

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading = true;

    forkJoin({
      auctions: this.auctionService.get({ flag: 'GET' }),
      teams: this.teamService.get({ flag: 'GET' }),
      players: this.playerService.get({ flag: 'GET' }),
    }).subscribe({
      next: ({ auctions, teams, players }) => {
        this.auctions = this.asArray(auctions);
        this.teams = this.asArray(teams);
        this.players = this.asArray(players);
        this.selectedAuctionId = this.getAuctionId(this.auctions[0]) || '';
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  onAuctionChange(event: Event): void {
    this.selectedAuctionId = (event.target as HTMLSelectElement).value;
  }

  get selectedAuction(): any {
    return this.auctions.find((auction) => this.isSame(this.getAuctionId(auction), this.selectedAuctionId));
  }

  get auctionTeams(): any[] {
    const auction = this.selectedAuction;
    return this.teams.filter((team) => this.isAuctionItem(team, auction));
  }

  get auctionPlayers(): any[] {
    const auction = this.selectedAuction;
    return this.players.filter((player) => this.isAuctionItem(player, auction));
  }

  get soldPlayers(): any[] {
    return this.auctionPlayers.filter((player) => this.isSold(player));
  }

  get unsoldPlayers(): any[] {
    return this.auctionPlayers.filter((player) => !this.isSold(player));
  }

  get teamSummaries(): TeamSummary[] {
    return this.auctionTeams.map((team) => {
      const teamPlayers = this.soldPlayers.filter((player) => this.isTeamPlayer(player, team));
      const purse = this.toNumber(team?.purse);
      const spent = teamPlayers.reduce((sum, player) => sum + this.toNumber(player?.soldPrice), 0);

      return {
        team,
        purse,
        spent,
        remaining: Math.max(purse - spent, 0),
        boughtCount: teamPlayers.length,
      };
    });
  }

  get totalPurse(): number {
    return this.teamSummaries.reduce((sum, item) => sum + item.purse, 0);
  }

  get remainingPurse(): number {
    return this.teamSummaries.reduce((sum, item) => sum + item.remaining, 0);
  }

  get historyPlayers(): any[] {
    return [...this.soldPlayers].sort((a, b) => this.toNumber(b?.soldPrice) - this.toNumber(a?.soldPrice));
  }

  getInitial(value: string | undefined): string {
    return value?.trim()?.[0]?.toUpperCase() || 'A';
  }

  getAuctionId(auction: any): number | string {
    return auction?.auctionId ?? auction?.AuctionId ?? auction?.id ?? '';
  }

  getTeamName(player: any): string {
    return player?.teamName ?? this.auctionTeams.find((team) => this.isTeamPlayer(player, team))?.teamName ?? '-';
  }

  private isAuctionItem(item: any, auction: any): boolean {
    if (!auction) return false;
    const auctionId = this.getAuctionId(auction);
    const itemAuctionId = item?.auctionId ?? item?.AuctionId ?? item?.p_auction_id;
    const itemAuctionName = item?.auctionName ?? item?.AuctionName;

    return this.isSame(itemAuctionId, auctionId) || this.isSame(itemAuctionName, auction?.auctionName);
  }

  private isTeamPlayer(player: any, team: any): boolean {
    const playerTeamId = player?.teamId ?? player?.TeamId ?? player?.p_team_id;
    const playerTeamName = player?.teamName ?? player?.TeamName;
    const teamId = team?.teamId ?? team?.TeamId ?? team?.id;

    return this.isSame(playerTeamId, teamId) || this.isSame(playerTeamName, team?.teamName);
  }

  private isSold(player: any): boolean {
    return player?.isSold === true || player?.isSold === 1 || String(player?.isSold).toLowerCase() === 'true';
  }

  private isSame(left: any, right: any): boolean {
    return left !== undefined && left !== null && right !== undefined && right !== null
      && String(left).toLowerCase() === String(right).toLowerCase();
  }

  private toNumber(value: any): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private asArray(value: any): any[] {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.data)) return value.data;
    if (Array.isArray(value?.result)) return value.result;
    if (Array.isArray(value?.items)) return value.items;
    return [];
  }
}
