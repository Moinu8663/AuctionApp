import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-player-view',
  imports: [DecimalPipe, MatButtonModule, MatDialogModule, MatIconModule],
  templateUrl: './player-view.html',
  styleUrl: './player-view.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerView {
  dialogRef = inject(MatDialogRef<PlayerView>);
  player = inject<any>(MAT_DIALOG_DATA);

  getInitial(value: string | undefined): string {
    return value?.trim()?.[0]?.toUpperCase() || 'P';
  }

  getSoldLabel(): string {
    return this.player?.isSold ? 'Sold' : 'Available';
  }
}
