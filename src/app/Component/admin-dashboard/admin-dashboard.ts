import { DecimalPipe, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, PLATFORM_ID } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { AuctionService } from '../../Services/AuctionService/auction-service';
import { DashboardSignalR } from '../../Services/DashboardSignalR/dashboard-signal-r';
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
  selector: 'app-admin-dashboard',
  imports: [DecimalPipe, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboard implements OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly auctionService = inject(AuctionService);
  private readonly teamService = inject(TeamService);
  private readonly playerService = inject(PlayerService);
  private readonly dashboardSignalR = inject(DashboardSignalR);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly platformId = inject(PLATFORM_ID);

  auctions: any[] = [];
  teams: any[] = [];
  players: any[] = [];
  selectedAuctionId: number | string = '';
  selectedPlayerId: number | string = '';
  pendingAuctionId: number | string = '';
  pendingPlayerId: number | string = '';
  isDashboardStarted = false;
  isSetupOpen = false;
  isNextPlayerOpen = false;
  isLoading = false;
  isBidUpdating = false;
  bidActionMessage = '';

  currentBid = 0;
  currentBidTeamId: number | string = '';
  currentBidTeamName = '';

  ngOnInit(): void {
    this.loadDashboard();
    this.dashboardSignalR.start();
    this.dashboardSignalR.bidPlaced$
      .pipe(takeUntil(this.destroy$))
      .subscribe((payload) => {
        const pid = payload?.playerId;
        const bid = Number(payload?.bidAmount);
        if (pid != null && this.isSame(pid, this.selectedPlayerId)) {
          this.currentBid         = bid;
          this.currentBidTeamId   = payload?.teamId ?? '';
          this.currentBidTeamName = payload?.teamName ?? '';
          this.players = this.players.map((p) =>
            this.isSame(this.getPlayerId(p), pid)
              ? { ...p, currentBidPrice: bid, teamName: payload?.teamName }
              : p
          );
          this.cdr.markForCheck();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboard(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

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
        this.selectedPlayerId = this.getPlayerId(this.auctionPlayers[0]) || '';
        this.pendingAuctionId = this.selectedAuctionId;
        this.pendingPlayerId = this.selectedPlayerId;
        this.isSetupOpen = true;
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
    this.selectedPlayerId = this.getPlayerId(this.auctionPlayers[0]) || '';
  }

  onPlayerChange(event: Event): void {
    this.selectedPlayerId = (event.target as HTMLSelectElement).value;
    this.dashboardSignalR.notifyDashboardUpdated({
      action: 'player-selected',
      entity: 'player',
      auctionId: this.selectedAuctionId,
      playerId: this.selectedPlayerId,
      playerData: this.selectedPlayer,
    });
  }

  onSetupAuctionChange(event: Event): void {
    this.pendingAuctionId = (event.target as HTMLSelectElement).value;
    this.pendingPlayerId = this.getPlayerId(this.pendingAuctionAvailablePlayers[0]) || '';
  }

  onSetupPlayerChange(event: Event): void {
    this.pendingPlayerId = (event.target as HTMLSelectElement).value;
  }

  startDashboard(): void {
    if (!this.pendingAuctionId || !this.pendingPlayerId) return;

    this.selectedAuctionId  = this.pendingAuctionId;
    this.selectedPlayerId   = this.pendingPlayerId;
    this.isDashboardStarted = true;
    this.isSetupOpen        = false;
    this.currentBid         = 0;
    this.currentBidTeamId   = '';
    this.currentBidTeamName = '';
    this.cdr.markForCheck();

    const player = this.selectedPlayer;
    if (player) {
      this.dashboardSignalR.notifyDashboardUpdated({
        action: 'player-selected',
        entity: 'player',
        auctionId: this.selectedAuctionId,
        playerId: this.selectedPlayerId,
        playerData: player,
      });
    }
  }

  openSetup(): void {
    this.pendingAuctionId = this.selectedAuctionId || this.getAuctionId(this.auctions[0]) || '';
    this.pendingPlayerId = this.getPlayerId(this.pendingAuctionAvailablePlayers[0]) || '';
    this.isSetupOpen = true;
  }

  openNextPlayer(): void {
    this.pendingAuctionId = this.selectedAuctionId || this.getAuctionId(this.auctions[0]) || '';
    this.pendingPlayerId = this.getPlayerId(this.pendingAuctionAvailablePlayers[0]) || '';
    this.isNextPlayerOpen = true;
    this.cdr.markForCheck();
  }

  closeNextPlayer(): void {
    this.isNextPlayerOpen = false;
    this.cdr.markForCheck();
  }

  confirmNextPlayer(): void {
    if (!this.pendingPlayerId) return;
    this.selectedPlayerId   = this.pendingPlayerId;
    this.isNextPlayerOpen   = false;
    this.currentBid         = 0;
    this.currentBidTeamId   = '';
    this.currentBidTeamName = '';
    const player = this.selectedPlayer;
    this.dashboardSignalR.notifyDashboardUpdated({
      action: 'player-selected',
      entity: 'player',
      auctionId: this.selectedAuctionId,
      playerId: this.selectedPlayerId,
      playerData: player,
    });
    this.cdr.markForCheck();
  }

  get selectedAuction(): any {
    return this.auctions.find((auction) => this.isSame(this.getAuctionId(auction), this.selectedAuctionId));
  }

  get selectedPlayer(): any {
    return this.auctionPlayers.find((player) => this.isSame(this.getPlayerId(player), this.selectedPlayerId));
  }

  get auctionTeams(): any[] {
    const auction = this.selectedAuction;
    return this.teams.filter((team) => this.isAuctionItem(team, auction));
  }

  get auctionPlayers(): any[] {
    const auction = this.selectedAuction;
    return this.players.filter((player) => this.isAuctionItem(player, auction));
  }

  get pendingAuction(): any {
    return this.auctions.find((auction) => this.isSame(this.getAuctionId(auction), this.pendingAuctionId));
  }

  get pendingAuctionPlayers(): any[] {
    const auction = this.pendingAuction;
    return this.players.filter((player) => this.isAuctionItem(player, auction));
  }

  get pendingAuctionAvailablePlayers(): any[] {
    return this.pendingAuctionPlayers.filter((player) => !this.isSold(player));
  }

  get pendingPlayer(): any {
    return this.pendingAuctionPlayers.find((player) => this.isSame(this.getPlayerId(player), this.pendingPlayerId));
  }

  get soldPlayers(): any[] {
    return this.auctionPlayers.filter((player) => this.isSold(player));
  }

  get teamSummaries(): TeamSummary[] {
    return this.auctionTeams.map((team) => {
      const teamPlayers = this.soldPlayers.filter((player) => this.isTeamPlayer(player, team));
      const purse = this.toNumber(team?.purse);
      const spent = teamPlayers.reduce((sum, player) => sum + this.getBidPrice(player), 0);

      return {
        team,
        purse,
        spent,
        remaining: Math.max(purse - spent, 0),
        boughtCount: teamPlayers.length,
      };
    });
  }

  get bidTeamName(): string {
    return this.currentBidTeamName || (this.selectedPlayer ? this.getTeamName(this.selectedPlayer) : '-');
  }

  get currentBidDisplay(): number {
    if (this.currentBid > 0) return this.currentBid;
    const p = this.selectedPlayer;
    return p ? this.toNumber(p?.basePrice ?? p?.BasePrice) : 0;
  }

  get selectedBidTeamId(): number | string {
    return this.currentBidTeamId || (this.selectedPlayer ? this.getTeamId(this.getPlayerTeam(this.selectedPlayer)) : '');
  }

  get historyPlayers(): any[] {
    return [...this.soldPlayers]
      .sort((a, b) => this.toTime(b?.updatedAt || b?.createdAt) - this.toTime(a?.updatedAt || a?.createdAt))
      .slice(0, 8);
  }

  getAuctionId(auction: any): number | string {
    return auction?.auctionId ?? auction?.AuctionId ?? auction?.id ?? '';
  }

  getPlayerId(player: any): number | string {
    return player?.playerId ?? player?.PlayerId ?? player?.id ?? '';
  }

  getInitial(value: string | undefined): string {
    return value?.trim()?.[0]?.toUpperCase() || 'A';
  }

  getBidPrice(player: any): number {
    return this.toNumber(player?.currentBidPrice ?? player?.currentBid ?? player?.soldPrice ?? player?.basePrice);
  }

  isPlayerSold(player: any): boolean {
    return this.isSold(player);
  }

  getTeamName(player: any): string {
    return player?.teamName ?? this.auctionTeams.find((team) => this.isTeamPlayer(player, team))?.teamName ?? '-';
  }

  markPlayerSold(): void {
    const player = this.selectedPlayer;
    if (!player || this.isBidUpdating) return;

    const teamId = this.selectedBidTeamId;
    if (!teamId) {
      this.bidActionMessage = 'Team not found for selected player.';
      this.cdr.markForCheck();
      return;
    }

    this.updatePlayerBidStatus(player, true, this.currentBidDisplay, teamId);
  }

  markPlayerUnsold(): void {
    const player = this.selectedPlayer;
    if (!player || this.isBidUpdating) return;

    this.updatePlayerBidStatus(player, false, 0, null);
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

  private updatePlayerBidStatus(player: any, isSold: boolean, soldPrice: number, teamId: number | string | null): void {
    this.isBidUpdating = true;
    this.bidActionMessage = '';

    const payload = {
      id: this.getPlayerId(player),
      playerName: player?.playerName ?? player?.PlayerName ?? '',
      picUrl: player?.picUrl ?? player?.PicUrl ?? '',
      age: player?.age ?? player?.Age ?? null,
      mobile: player?.mobile ?? player?.Mobile ?? '',
      email: player?.email ?? player?.Email ?? '',
      country: player?.country ?? player?.Country ?? '',
      role: player?.role ?? player?.Role ?? '',
      basePrice: this.toNumber(player?.basePrice ?? player?.BasePrice),
      soldPrice,
      isSold,
      teamId,
      auctionId: this.selectedAuctionId,
      created_By: this.loginEmail,
      updated_By: this.loginEmail,
    };

    this.playerService.update(payload).subscribe({
      next: () => {
        this.players = this.players.map((item) => this.isSame(this.getPlayerId(item), this.getPlayerId(player))
          ? {
              ...item,
              soldPrice,
              isSold,
              teamId,
              teamName: isSold ? this.bidTeamName : null,
              updated_By: this.loginEmail,
              updatedAt: new Date().toISOString(),
            }
          : item);
        this.isBidUpdating = false;
        this.bidActionMessage = '';
        this.dashboardSignalR.notifyDashboardUpdated({
          action: isSold ? 'player-sold' : 'player-unsold',
          entity: 'player',
          auctionId: this.selectedAuctionId,
          teamId,
          playerId: this.getPlayerId(player),
        });
        this.openNextPlayer();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isBidUpdating = false;
        this.bidActionMessage = err?.error?.message || 'Player update failed.';
        this.cdr.markForCheck();
      },
    });
  }

  private getPlayerTeam(player: any): any {
    return this.auctionTeams.find((team) => this.isTeamPlayer(player, team));
  }

  private getTeamId(team: any): number | string {
    return team?.teamId ?? team?.TeamId ?? team?.id ?? '';
  }

  private get loginEmail(): string {
    return isPlatformBrowser(this.platformId) ? (sessionStorage.getItem('email') ?? '') : '';
  }

  private hasSoldPrice(player: any): boolean {
    const price = player?.soldPrice ?? player?.SoldPrice;
    return price !== null && price !== undefined && price !== '' && Number(price) > 0;
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

  private toTime(value: any): number {
    const parsed = new Date(value).getTime();
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
