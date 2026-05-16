import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, ViewChild, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil } from 'rxjs';
import { Roleservice } from '../../Services/RoleService/roleservice';
import { AddMenuAccess } from '../add-menu-access/add-menu-access';

@Component({
  selector: 'app-menu-access-panel',
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatTooltipModule,
  ],
  templateUrl: './menu-access-panel.html',
  styleUrl: './menu-access-panel.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuAccessPanel implements OnDestroy {
  private readonly roleService = inject(Roleservice);
  private readonly dialog = inject(MatDialog);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns = ['no', 'roleName', 'actions'];
  dataSource = new MatTableDataSource<any>([]);
  isLoading = false;

  ngOnInit(): void {
    this.loadRoles();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRoles(): void {
    this.isLoading = true;

    this.roleService.get({ flag: 'GET' }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        this.dataSource.data = Array.isArray(res) ? res : [];
        this.isLoading = false;

        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
        }

        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  openEdit(role: any): void {
    this.dialog.open(AddMenuAccess, {
      data: { ...role, mode: 'edit' },
      width: '760px',
      maxWidth: '95vw',
    }).afterClosed().subscribe((changed) => {
      if (changed) this.loadRoles();
    });
  }

  getRoleName(role: any): string {
    return role?.p_role_name ?? role?.roleName ?? role?.name ?? '';
  }
}
