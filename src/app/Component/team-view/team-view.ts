import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { catchError, of } from 'rxjs';
import { PlayerService } from '../../Services/PlayerService/player-service';

@Component({
  selector: 'app-team-view',
  imports: [DecimalPipe, MatButtonModule, MatDialogModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './team-view.html',
  styleUrl: './team-view.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamView {
  private readonly playerService = inject(PlayerService);
  private readonly cdr = inject(ChangeDetectorRef);

  dialogRef = inject(MatDialogRef<TeamView>);
  team = inject<any>(MAT_DIALOG_DATA);
  players: any[] = [];
  isLoadingPlayers = false;

  ngOnInit(): void {
    this.loadPlayers();
  }

  getInitial(value: string | undefined): string {
    return value?.trim()?.[0]?.toUpperCase() || 'T';
  }

  loadPlayers(): void {
    this.isLoadingPlayers = true;

    this.playerService.get({
      flag: 'GET',
      teamId: this.getTeamId(this.team),
      TeamId: this.getTeamId(this.team),
      teamName: this.team?.teamName,
    }).pipe(
      catchError(() => of([]))
    ).subscribe((res) => {
      const players = this.asArray(res);
      this.players = players.filter((player) => this.isTeamPlayer(player));
      this.isLoadingPlayers = false;
      this.cdr.markForCheck();
    });
  }

  getPlayerId(player: any): number | string {
    return player?.playerId ?? player?.PlayerId ?? player?.id ?? player?.playerName ?? '';
  }

  private isTeamPlayer(player: any): boolean {
    const teamId = this.getTeamId(this.team);
    const playerTeamId = player?.teamId ?? player?.TeamId ?? player?.p_team_id;
    const playerTeamName = player?.teamName ?? player?.TeamName;

    return this.isSameValue(playerTeamId, teamId) || this.isSameValue(playerTeamName, this.team?.teamName);
  }

  private getTeamId(team: any): number | string {
    return team?.teamId ?? team?.TeamId ?? team?.id ?? '';
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
