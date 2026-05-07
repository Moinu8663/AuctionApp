import { Component, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { ProfileService } from '../../Services/Profile/ProfileService';
import { AuctionService } from '../../Services/AuctionService/auction-service';
import { TeamService } from '../../Services/TeamService/team-service';
import { PlayerService } from '../../Services/PlayerService/player-service';
import { isPlatformBrowser, DatePipe } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AddMpin } from '../add-mpin/add-mpin';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-home',
  imports: [MatDialogModule, MatProgressSpinnerModule, DatePipe],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private readonly profileservice = inject(ProfileService);
  private readonly auctionService = inject(AuctionService);
  private readonly teamService    = inject(TeamService);
  private readonly playerService  = inject(PlayerService);
  private readonly platformId     = inject(PLATFORM_ID);
  private readonly dialog         = inject(MatDialog);
  private readonly cdr             = inject(ChangeDetectorRef);

  username       = '';
  activityLoading = false;

  stats = { auctions: 0, teams: 0, players: 0 };
  recentActivity: { icon: string; label: string; sub: string; type: string; date: Date | null }[] = [];

  private getEmail(): string | null {
    return isPlatformBrowser(this.platformId) ? sessionStorage.getItem('email') : null;
  }

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.username = sessionStorage.getItem('username') || 'User';
    }
    this.checkMpin();
    this.loadActivity();
  }

  checkMpin() {
    this.profileservice.CheckMpin({ email: this.getEmail() }).subscribe({
      next: (res) => {
        if (res?.[0]?.status == 0) {
          setTimeout(() => {
            const ref = this.dialog.open(AddMpin, { width: '400px', disableClose: true });
            ref.componentInstance.mpinForm.patchValue({ email: this.getEmail() });
          });
        }
      },
      error: () => {}
    });
  }

  private parseDate(raw: string): Date | null {
    if (!raw) return null;
    // convert "05-05-2026 10.07.13 AM" → "05-05-2026 10:07:13 AM"
    const normalized = raw.replace(/(\d{2})\.(\d{2})\.(\d{2})/, '$1:$2:$3');
    const d = new Date(normalized);
    return isNaN(d.getTime()) ? null : d;
  }

  loadActivity() {
    this.activityLoading = true;
    forkJoin({
      auctions: this.auctionService.get({ flag: 'GET' }),
      teams:    this.teamService.get({ flag: 'GET' }),
      players:  this.playerService.get({ flag: 'GET' }),
    }).subscribe({
      next: ({ auctions, teams, players }) => {
        const a = Array.isArray(auctions) ? auctions : [];
        const t = Array.isArray(teams)    ? teams    : [];
        const p = Array.isArray(players)  ? players  : [];

        this.stats = { auctions: a.length, teams: t.length, players: p.length };

        const activities = [
          ...a.map((x: any) => ({ icon: '🏆', label: x.auctionName, sub: `Auction • by ${x.createdBy ?? '—'}`, type: 'auction', date: this.parseDate(x.createdAt) })),
          ...t.map((x: any) => ({ icon: '🛡️', label: x.teamName,    sub: `Team • Owner: ${x.ownerName ?? '—'}`,  type: 'team',    date: this.parseDate(x.createdAt) })),
          ...p.map((x: any) => ({ icon: '🏏', label: x.playerName,  sub: `Player • ${x.role ?? '—'}`,            type: 'player',  date: this.parseDate(x.createdAt) })),
        ];

        this.recentActivity = activities
          .filter(x => x.date)
          .sort((a, b) => b.date!.getTime() - a.date!.getTime())
          .slice(0, 10);

        this.activityLoading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.activityLoading = false; this.cdr.detectChanges(); }
    });
  }
}
