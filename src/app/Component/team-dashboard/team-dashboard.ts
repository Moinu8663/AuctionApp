import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { debounceTime, forkJoin, Subject, takeUntil } from 'rxjs';
import { AuctionService } from '../../Services/AuctionService/auction-service';
import { DashboardSignalR } from '../../Services/DashboardSignalR/dashboard-signal-r';
import { PlayerService } from '../../Services/PlayerService/player-service';
import { TeamService } from '../../Services/TeamService/team-service';

@Component({
  selector: 'app-team-dashboard',
  imports: [DecimalPipe, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './team-dashboard.html',
  styleUrl: './team-dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamDashboard implements OnDestroy {
  private readonly auctionService = inject(AuctionService);
  private readonly teamService    = inject(TeamService);
  private readonly playerService  = inject(PlayerService);
  private readonly signalR        = inject(DashboardSignalR);
  private readonly cdr            = inject(ChangeDetectorRef);
  private readonly destroy$       = new Subject<void>();

  auctions: any[] = [];
  teams:    any[] = [];
  players:  any[] = [];

  selectedAuctionId: number | string = '';
  selectedTeamId:    number | string = '';
  pendingAuctionId:  number | string = '';
  pendingTeamId:     number | string = '';

  isSetupOpen    = true;
  isDashboardVisible = false;
  isLoading      = false;

  livePlayer:    any    = null;
  currentBid:    number = 0;
  currentBidTeamName: string = '';
  bidMessage:    string = '';

  ngOnInit(): void {
    this.loadData();
    this.signalR.start();

    // Receive player-selected from admin → update live player
    this.signalR.dashboardUpdated$
      .pipe(debounceTime(100), takeUntil(this.destroy$))
      .subscribe((payload) => {
        if (payload?.action === 'player-selected') {
          if (this.selectedAuctionId && !this.isSame(this.selectedAuctionId, payload?.auctionId)) return;

          this.applyLivePlayerPayload(payload);
        } else if (payload?.action === 'player-sold' || payload?.action === 'player-unsold') {
          this.loadData(false);
        }
      });

    // Receive bids from other teams
    this.signalR.bidPlaced$
      .pipe(takeUntil(this.destroy$))
      .subscribe((payload) => {
        if (this.livePlayer && this.isSame(this.getPlayerId(this.livePlayer), payload?.playerId)) {
          this.currentBid = Number(payload?.bidAmount);
          this.currentBidTeamName = payload?.teamName ?? '';
          this.cdr.markForCheck();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(showLoader = true, targetAuctionId?: any, targetPlayerId?: any): void {
    if (showLoader) { this.isLoading = true; this.cdr.markForCheck(); }

    forkJoin({
      auctions: this.auctionService.get({ flag: 'GET' }),
      teams:    this.teamService.get({ flag: 'GET' }),
      players:  this.playerService.get({ flag: 'GET' }),
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: ({ auctions, teams, players }) => {
        this.auctions = this.asArray(auctions);
        this.teams    = this.asArray(teams);
        this.players  = this.asArray(players);

        if (targetAuctionId != null) this.selectedAuctionId = targetAuctionId;
        if (!this.pendingAuctionId) this.pendingAuctionId = this.getAuctionId(this.auctions[0]) || '';
        if (!this.pendingTeamId)    this.pendingTeamId    = this.getTeamId(this.pendingAuctionTeams[0]) || '';

        if (targetPlayerId != null) {
          const found = this.players.find((p) => this.isSame(this.getPlayerId(p), targetPlayerId));
          if (found) {
            this.livePlayer = found;
            this.isDashboardVisible = true;
            this.isSetupOpen = false;
          }
        }
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => { this.isLoading = false; this.cdr.markForCheck(); },
    });
  }

  onSetupAuctionChange(e: Event): void {
    this.pendingAuctionId = (e.target as HTMLSelectElement).value;
    this.pendingTeamId = this.getTeamId(this.pendingAuctionTeams[0]) || '';
    this.cdr.markForCheck();
  }

  onSetupTeamChange(e: Event): void {
    this.pendingTeamId = (e.target as HTMLSelectElement).value;
  }

  viewDashboard(): void {
    if (!this.pendingAuctionId || !this.pendingTeamId) return;
    this.selectedAuctionId = this.pendingAuctionId;
    this.selectedTeamId    = this.pendingTeamId;
    this.isDashboardVisible = true;
    this.isSetupOpen = false;
    this.loadLivePlayerFromAdmin();
    this.cdr.markForCheck();
  }

  placeBid(): void {
    if (!this.livePlayer || !this.selectedTeam) return;

    const base    = this.getPlayerBasePrice(this.livePlayer);
    const nextBid = this.currentBid > 0 ? this.currentBid + 200000 : base;

    this.currentBid         = nextBid;
    this.currentBidTeamName = this.getTeamName(this.selectedTeam);
    this.bidMessage         = `Bid of Rs ${nextBid.toLocaleString()} placed!`;

    this.signalR.placeBid(
      this.selectedAuctionId,
      this.getPlayerId(this.livePlayer),
      this.selectedTeamId,
      this.currentBidTeamName,
      nextBid,
    );
    this.cdr.markForCheck();
  }

  get selectedAuction(): any {
    return this.auctions.find((a) => this.isSame(this.getAuctionId(a), this.selectedAuctionId));
  }

  get selectedTeam(): any {
    return this.teams.find((t) => this.isSame(this.getTeamId(t), this.selectedTeamId));
  }

  get pendingAuction(): any {
    return this.auctions.find((a) => this.isSame(this.getAuctionId(a), this.pendingAuctionId));
  }

  get pendingAuctionTeams(): any[] {
    const auction = this.pendingAuction;
    if (!auction) return [];
    return this.teams.filter((t) => this.isAuctionItem(t, auction));
  }

  get auctionTeams(): any[] {
    const auction = this.selectedAuction;
    if (!auction) return [];
    return this.teams.filter((t) => this.isAuctionItem(t, auction));
  }

  get auctionPlayers(): any[] {
    const auction = this.selectedAuction;
    if (!auction) return [];
    return this.players.filter((p) => this.isAuctionItem(p, auction));
  }

  get myTeamPlayers(): any[] {
    return this.auctionPlayers.filter((p) => {
      const playerTeamId = p?.teamId ?? p?.TeamId ?? p?.p_team_id;
      const playerTeamName = p?.teamName ?? p?.TeamName;
      return (this.isSame(playerTeamId, this.selectedTeamId) || this.isSame(playerTeamName, this.getTeamName(this.selectedTeam))) && this.isSold(p);
    });
  }

  get myTeam(): any {
    return this.teams.find((t) => this.isSame(this.getTeamId(t), this.selectedTeamId));
  }

  get remainingPurse(): number {
    const purse = this.toNumber(this.myTeam?.purse ?? this.myTeam?.Purse);
    const spent = this.myTeamPlayers.reduce((s, p) => s + this.toNumber(p?.soldPrice ?? p?.SoldPrice ?? p?.basePrice ?? p?.BasePrice), 0);
    return Math.max(purse - spent, 0);
  }

  get nextBidAmount(): number {
    if (!this.livePlayer) return 0;
    return this.currentBid > 0
      ? this.currentBid + 200000
      : this.getPlayerBasePrice(this.livePlayer);
  }

  get canBid(): boolean {
    if (!this.livePlayer || !this.selectedTeam) return false;
    return this.nextBidAmount <= this.remainingPurse && this.nextBidAmount > 0;
  }

  get currentBidDisplay(): number {
    if (!this.livePlayer) return 0;
    return this.currentBid > 0 ? this.currentBid : this.getPlayerBasePrice(this.livePlayer);
  }

  getPlayerName(p: any): string { return p?.playerName ?? p?.PlayerName ?? '-'; }
  getPlayerRole(p: any): string { return p?.role ?? p?.Role ?? 'Player'; }
  getPlayerCountry(p: any): string { return p?.country ?? p?.Country ?? '-'; }
  getPlayerPicUrl(p: any): string { return p?.picUrl ?? p?.PicUrl ?? ''; }
  getPlayerBasePrice(p: any): number { return this.toNumber(p?.basePrice ?? p?.BasePrice); }
  getAuctionName(a: any): string { return a?.auctionName ?? a?.AuctionName ?? '-'; }
  getTeamName(t: any): string { return t?.teamName ?? t?.TeamName ?? '-'; }
  getTeamOwner(t: any): string { return t?.ownerName ?? t?.OwnerName ?? '-'; }
  getTeamPurse(t: any): number { return this.toNumber(t?.purse ?? t?.Purse); }

  getInitial(v: string | undefined): string {
    return v?.trim()?.[0]?.toUpperCase() || 'T';
  }

  getAuctionId(a: any): number | string { return a?.auctionId ?? a?.AuctionId ?? a?.id ?? a?.Id ?? ''; }
  getTeamId(t: any):    number | string { return t?.teamId   ?? t?.TeamId   ?? t?.id ?? t?.Id ?? ''; }
  getPlayerId(p: any):  number | string { return p?.playerId ?? p?.PlayerId ?? p?.id ?? ''; }

  private isAuctionItem(item: any, auction: any): boolean {
    if (!auction) return false;
    const aid = this.getAuctionId(auction);
    return this.isSame(item?.auctionId ?? item?.AuctionId ?? item?.p_auction_id, aid) ||
           this.isSame(item?.auctionName ?? item?.AuctionName, this.getAuctionName(auction));
  }

  private isSold(p: any): boolean {
    return p?.isSold === true || p?.isSold === 1 || String(p?.isSold).toLowerCase() === 'true';
  }

  private isSame(l: any, r: any): boolean {
    return l != null && r != null && String(l).toLowerCase() === String(r).toLowerCase();
  }

  private toNumber(v: any): number {
    const n = Number(v); return Number.isFinite(n) ? n : 0;
  }

  private asArray(v: any): any[] {
    if (Array.isArray(v)) return v;
    if (Array.isArray(v?.data)) return v.data;
    if (Array.isArray(v?.result)) return v.result;
    if (Array.isArray(v?.items)) return v.items;
    return [];
  }

  private loadLivePlayerFromAdmin(): void {
    this.signalR.getCurrentDashboardState(this.selectedAuctionId)
      .then((payload) => {
        if (payload?.action === 'player-selected') {
          this.applyLivePlayerPayload(payload);
        } else {
          this.cdr.markForCheck();
        }
      });
  }

  private applyLivePlayerPayload(payload: any): void {
    this.currentBid = 0;
    this.currentBidTeamName = '';
    this.bidMessage = '';

    if (payload?.auctionId != null) this.selectedAuctionId = payload.auctionId;
    const playerData = this.parsePlayerData(payload?.playerDataJson);

    if (playerData) {
      this.livePlayer = playerData;
      this.isDashboardVisible = true;
      this.isSetupOpen = false;
      this.cdr.markForCheck();
      return;
    }

    this.loadData(false, payload?.auctionId, payload?.playerId);
  }

  private parsePlayerData(value: any): any {
    if (!value || value === '{}') return null;
    if (typeof value === 'object') return value;
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
}
