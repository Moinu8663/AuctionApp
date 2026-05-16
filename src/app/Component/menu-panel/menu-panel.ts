import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, ViewChild, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil } from 'rxjs';
import { MenuService } from '../../Services/MenuService/menu-service';
import { AddMenu } from '../add-menu/add-menu';

@Component({
  selector: 'app-menu-panel',
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatTooltipModule,
  ],
  templateUrl: './menu-panel.html',
  styleUrl: './menu-panel.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuPanel implements OnDestroy {
  private readonly menuService = inject(MenuService);
  private readonly dialog = inject(MatDialog);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns = ['no', 'menuName', 'icon', 'routeUrl', 'parentMenu', 'actions'];
  dataSource = new MatTableDataSource<any>([]);
  isLoading = false;

  ngOnInit(): void {
    this.loadMenus();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadMenus(): void {
    this.isLoading = true;
    this.menuService.get({ flag: 'GET' }).pipe(takeUntil(this.destroy$)).subscribe({
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

  openAdd(): void {
    this.dialog.open(AddMenu, { data: null, width: '480px', maxWidth: '95vw' })
      .afterClosed().subscribe((changed) => { if (changed) this.loadMenus(); });
  }

  openEdit(menu: any): void {
    this.dialog.open(AddMenu, { data: { ...menu, mode: 'edit' }, width: '480px', maxWidth: '95vw' })
      .afterClosed().subscribe((changed) => { if (changed) this.loadMenus(); });
  }

  openDelete(menu: any): void {
    this.dialog.open(AddMenu, { data: { ...menu, mode: 'delete' }, width: '380px', maxWidth: '95vw' })
      .afterClosed().subscribe((changed) => { if (changed) this.loadMenus(); });
  }

  getMenuName(menu: any): string {
    return menu?.menuName ?? menu?.p_menu_name ?? menu?.name ?? '';
  }

  getIcon(menu: any): string {
    return menu?.icon ?? 'menu';
  }

  getRoute(menu: any): string {
    return menu?.routeUrl ?? menu?.route ?? '-';
  }

  getParentMenu(menu: any): string {
    return menu?.parentMenuName ?? menu?.parent_MenuName ?? (menu?.parentMenuId ? String(menu.parentMenuId) : '-');
  }
}
