import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DashboardSignalR {
  private readonly platformId = inject(PLATFORM_ID);
  private connection: signalR.HubConnection | null = null;
  private started = false;
  private startPromise: Promise<void> | null = null;
  private currentStateSupported = true;

  readonly dashboardUpdated$ = new Subject<any>();
  readonly bidPlaced$ = new Subject<any>();

  get isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }

  start(): void {
    if (!isPlatformBrowser(this.platformId) || this.started) return;

    this.started = true;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(environment.signalRHubUrl, {
        accessTokenFactory: () => sessionStorage.getItem('token') ?? '',
      })
      .withAutomaticReconnect()
      .build();

    this.connection.on('DashboardUpdated', (payload) => {
      this.dashboardUpdated$.next(payload);
    });

    this.connection.on('BidPlaced', (payload) => {
      this.bidPlaced$.next(payload);
    });

    this.connection.onreconnected(() => {
      this.dashboardUpdated$.next({ action: 'signalr-reconnected' });
    });

    this.startPromise = this.connection
      .start()
      .catch((error) => {
        console.error('Dashboard SignalR connection failed:', error);
        this.started = false;
        this.startPromise = null;
      });
  }

  notifyDashboardUpdated(payload: any): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.start();
    this.waitForConnection()
      .then(() => this.connection?.invoke(
        'NotifyDashboardUpdated',
        payload?.action ?? 'dashboard-updated',
        payload?.entity ?? 'dashboard',
        this.toNullableNumber(payload?.auctionId),
        this.toNullableNumber(payload?.teamId),
        this.toNullableNumber(payload?.playerId),
        payload?.playerData ? JSON.stringify(payload.playerData) : '{}',
      ))
      .catch((error) => console.error('Dashboard SignalR notify failed:', error));
  }

  placeBid(auctionId: any, playerId: any, teamId: any, teamName: string, bidAmount: number): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.start();
    this.waitForConnection()
      .then(() => this.connection?.invoke(
        'PlaceBid',
        this.toNullableNumber(auctionId),
        this.toNullableNumber(playerId),
        this.toNullableNumber(teamId),
        teamName,
        bidAmount,
      ))
      .catch((error) => console.error('Dashboard SignalR bid failed:', error));
  }

  getCurrentDashboardState(auctionId: any): Promise<any | null> {
    if (!isPlatformBrowser(this.platformId)) return Promise.resolve(null);
    if (!this.currentStateSupported) return Promise.resolve(null);

    this.start();
    return this.waitForConnection()
      .then(() => this.connection?.invoke('GetCurrentDashboardState', this.toNullableNumber(auctionId)) ?? null)
      .catch((error) => {
        const message = String(error?.message ?? error);
        if (message.includes('Method does not exist')) {
          this.currentStateSupported = false;
          return null;
        }

        console.error('Dashboard SignalR current state failed:', error);
        return null;
      });
  }

  stop(): void {
    if (!this.connection) return;

    this.connection.stop();
    this.connection = null;
    this.started = false;
    this.startPromise = null;
  }

  private waitForConnection(): Promise<void> {
    if (this.isConnected) return Promise.resolve();
    return (this.startPromise ?? Promise.reject('SignalR not started'));
  }

  private toNullableNumber(value: any): number | null {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
}
