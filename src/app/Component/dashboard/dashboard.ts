import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { debounceTime, forkJoin, Subject, takeUntil } from 'rxjs';
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
  selector: 'app-dashboard',
  imports: [DecimalPipe, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard implements OnDestroy {
  private readonly auctionService = inject(AuctionService);
  private readonly teamService = inject(TeamService);
  private readonly playerService = inject(PlayerService);
  private readonly dashboardSignalR = inject(DashboardSignalR);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();

  auctions: any[] = [];
  teams: any[] = [];
  players: any[] = [];
  selectedAuctionId: number | string = '';
  selectedPlayerId: number | string = '';
  pendingAuctionId: number | string = '';
  lastLiveAction = '';
  isLoading = false;
  isSetupOpen = false;
  isDashboardVisible = false;
  liveAuctionId: number | string = '';
  livePlayerId: number | string = '';
  currentBid = 0;
  currentBidTeamName = '';
  bidTimerSeconds = 0;
  private timerInterval: any = null;

  ngOnInit(): void {
    this.loadDashboard();
    this.dashboardSignalR.start();

    this.dashboardSignalR.dashboardUpdated$
      .pipe(debounceTime(150), takeUntil(this.destroy$))
      .subscribe((payload) => {
        this.lastLiveAction = payload?.action || 'dashboard-updated';

        if (payload?.action === 'player-selected') {
          const auctionId = payload?.auctionId;
          const playerId = payload?.playerId;
          if (auctionId != null) this.liveAuctionId = auctionId;
          if (playerId != null) this.livePlayerId = playerId;
          this.isDashboardVisible = true;
          this.isSetupOpen = false;
          this.currentBid = 0;
          this.currentBidTeamName = '';
          this.clearLocalTimer();
          this.loadDashboard(false);
        } else if (payload?.action === 'timer-reset') {
          const data = this.parseJson(payload?.playerDataJson);
          const secs = Number(data?.timerSeconds);
          if (Number.isFinite(secs) && secs > 0) this.startLocalTimer(secs);
        } else {
          this.loadDashboard(false);
        }
      });

    this.dashboardSignalR.bidPlaced$
      .pipe(takeUntil(this.destroy$))
      .subscribe((payload) => {
        if (!this.isSame(payload?.auctionId, this.selectedAuctionId) || !this.isSame(payload?.playerId, this.selectedPlayerId)) return;

        this.currentBid = this.toNumber(payload?.bidAmount);
        this.currentBidTeamName = payload?.teamName ?? '';
        this.players = this.players.map((player) => this.isSame(this.getPlayerId(player), payload?.playerId)
          ? { ...player, currentBidPrice: this.currentBid, teamName: this.currentBidTeamName }
          : player);
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.clearLocalTimer();
  }

  loadDashboard(showLoader = true): void {
    if (showLoader) {
      this.isLoading = true;
    }

    forkJoin({
      auctions: this.auctionService.get({ flag: 'GET' }),
      teams: this.teamService.get({ flag: 'GET' }),
      players: this.playerService.get({ flag: 'GET' }),
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: ({ auctions, teams, players }) => {
        this.auctions = this.asArray(auctions);
        this.teams = this.asArray(teams);
        this.players = this.asArray(players);

        const targetAuctionId = this.liveAuctionId || this.selectedAuctionId;
        const targetPlayerId  = this.livePlayerId  || this.selectedPlayerId;

        this.selectedAuctionId = this.auctions.some((a) => this.isSame(this.getAuctionId(a), targetAuctionId))
          ? targetAuctionId
          : this.getAuctionId(this.auctions[0]) || '';

        this.selectedPlayerId = this.auctionPlayers.some((p) => this.isSame(this.getPlayerId(p), targetPlayerId))
          ? targetPlayerId
          : (this.isDashboardVisible ? targetPlayerId : this.getPlayerId(this.auctionPlayers[0]) || '');

        this.pendingAuctionId = this.pendingAuctionId || this.selectedAuctionId;
        this.isSetupOpen = !this.isDashboardVisible;
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

  onSetupAuctionChange(event: Event): void {
    this.pendingAuctionId = (event.target as HTMLSelectElement).value;
  }

  onPlayerChange(event: Event): void {
    this.selectedPlayerId = (event.target as HTMLSelectElement).value;
  }

  viewDashboard(): void {
    if (!this.pendingAuctionId) return;
    this.liveAuctionId = this.pendingAuctionId;
    this.livePlayerId = '';
    this.selectedAuctionId = this.pendingAuctionId;
    this.selectedPlayerId = this.getPlayerId(this.auctionPlayers[0]) || '';
    this.isDashboardVisible = true;
    this.isSetupOpen = false;
    this.loadLivePlayerFromAdmin();
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

  get soldPlayers(): any[] {
    return this.auctionPlayers.filter((player) => this.isSold(player));
  }

  get unsoldPlayers(): any[] {
    return this.auctionPlayers.filter((player) => !this.isSold(player));
  }

  get teamSummaries(): TeamSummary[] {
    return this.auctionTeams.map((team) => {
      const teamPlayers = this.soldPlayers.filter((player) => this.isTeamPlayer(player, team));
      const purse = this.getTeamPurse(team);
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

  get totalPurse(): number {
    return this.teamSummaries.reduce((sum, item) => sum + item.purse, 0);
  }

  get remainingPurse(): number {
    return this.teamSummaries.reduce((sum, item) => sum + item.remaining, 0);
  }

  get historyPlayers(): any[] {
    return [...this.soldPlayers]
      .sort((a, b) => this.toTime(b?.updatedAt || b?.createdAt) - this.toTime(a?.updatedAt || a?.createdAt))
      .slice(0, 8);
  }

  get bidTeamName(): string {
    return this.currentBidTeamName || (this.selectedPlayer ? this.getPlayerTeamName(this.selectedPlayer) : '-');
  }

  get liveStatusLabel(): string {
    return this.dashboardSignalR.isConnected ? 'Live' : 'Connecting';
  }

  getInitial(value: string | undefined): string {
    return value?.trim()?.[0]?.toUpperCase() || 'A';
  }

  getAuctionName(auction: any): string {
    return auction?.auctionName ?? auction?.AuctionName ?? '-';
  }

  getAuctionId(auction: any): number | string {
    return auction?.auctionId ?? auction?.AuctionId ?? auction?.id ?? auction?.Id ?? '';
  }

  getPlayerId(player: any): number | string {
    return player?.playerId ?? player?.PlayerId ?? player?.id ?? player?.Id ?? '';
  }

  getBidPrice(player: any): number {
    if (this.selectedPlayer && this.isSame(this.getPlayerId(player), this.selectedPlayerId) && this.currentBid > 0) {
      return this.currentBid;
    }

    return this.toNumber(player?.currentBidPrice ?? player?.CurrentBidPrice ?? player?.currentBid ?? player?.CurrentBid ?? player?.soldPrice ?? player?.SoldPrice ?? player?.basePrice ?? player?.BasePrice);
  }

  isPlayerSold(player: any): boolean {
    return this.isSold(player);
  }

  getPlayerName(player: any): string {
    return player?.playerName ?? player?.PlayerName ?? '-';
  }

  getPlayerRole(player: any): string {
    return player?.role ?? player?.Role ?? 'Player';
  }

  getPlayerPicUrl(player: any): string {
    return player?.picUrl ?? player?.PicUrl ?? '';
  }

  getPlayerBasePrice(player: any): number {
    return this.toNumber(player?.basePrice ?? player?.BasePrice);
  }

  getTeamName(team: any): string {
    return team?.teamName ?? team?.TeamName ?? '-';
  }

  getTeamOwner(team: any): string {
    return team?.ownerName ?? team?.OwnerName ?? 'No owner';
  }

  getTeamPurse(team: any): number {
    return this.toNumber(team?.purse ?? team?.Purse);
  }

  getTeamLogoUrl(team: any): string {
    return team?.logoUrl ?? team?.LogoUrl ?? '';
  }

  getPlayerTeamName(player: any): string {
    return player?.teamName ?? player?.TeamName ?? this.getTeamName(this.auctionTeams.find((team) => this.isTeamPlayer(player, team)));
  }

  private isAuctionItem(item: any, auction: any): boolean {
    if (!auction) return false;
    const auctionId = this.getAuctionId(auction);
    const itemAuctionId = item?.auctionId ?? item?.AuctionId ?? item?.p_auction_id;
    const itemAuctionName = item?.auctionName ?? item?.AuctionName;

    return this.isSame(itemAuctionId, auctionId) || this.isSame(itemAuctionName, this.getAuctionName(auction));
  }

  private isTeamPlayer(player: any, team: any): boolean {
    const playerTeamId = player?.teamId ?? player?.TeamId ?? player?.p_team_id;
    const playerTeamName = player?.teamName ?? player?.TeamName;
    const teamId = team?.teamId ?? team?.TeamId ?? team?.id ?? team?.Id;

    return this.isSame(playerTeamId, teamId) || this.isSame(playerTeamName, this.getTeamName(team));
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

  private startLocalTimer(seconds: number): void {
    this.clearLocalTimer();
    this.bidTimerSeconds = seconds;
    this.cdr.markForCheck();
    this.timerInterval = setInterval(() => {
      this.bidTimerSeconds--;
      this.cdr.markForCheck();
      if (this.bidTimerSeconds <= 0) this.clearLocalTimer();
    }, 1000);
  }

  private clearLocalTimer(): void {
    if (this.timerInterval) { clearInterval(this.timerInterval); this.timerInterval = null; }
    this.bidTimerSeconds = 0;
  }

  private parseJson(value: any): any {
    if (!value || value === '{}') return null;
    if (typeof value === 'object') return value;
    try { return JSON.parse(value); } catch { return null; }
  }

  private loadLivePlayerFromAdmin(): void {
    this.dashboardSignalR.getCurrentDashboardState(this.selectedAuctionId)
      .then((payload) => {
        if (payload?.action !== 'player-selected') return;

        if (payload?.auctionId != null) this.liveAuctionId = payload.auctionId;
        if (payload?.playerId != null) this.livePlayerId = payload.playerId;
        this.selectedAuctionId = this.liveAuctionId || this.selectedAuctionId;
        this.selectedPlayerId = this.livePlayerId || this.selectedPlayerId;
        this.currentBid = 0;
        this.currentBidTeamName = '';
        this.loadDashboard(false);
      });
  }
}
