import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, PLATFORM_ID, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { catchError, forkJoin, of } from 'rxjs';
import { MenuAccessService } from '../../Services/MenuAccessService/menu-access-service';
import { MenuService } from '../../Services/MenuService/menu-service';

interface MenuAccessRow {
  menu: any;
  access: any | null;
}

@Component({
  selector: 'app-add-menu-access',
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatTooltipModule,
  ],
  templateUrl: './add-menu-access.html',
  styleUrl: './add-menu-access.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddMenuAccess {
  private readonly menuService = inject(MenuService);
  private readonly menuAccessService = inject(MenuAccessService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly platformId = inject(PLATFORM_ID);

  dialogRef = inject(MatDialogRef<AddMenuAccess>, { optional: true });
  dialogData = inject<any>(MAT_DIALOG_DATA, { optional: true });

  displayedColumns = ['no', 'menuName', 'access', 'actions'];
  rows: MenuAccessRow[] = [];
  loading = false;
  errorMsg = '';
  changed = false;
  updatingMenuIds = new Set<number | string>();

  private get createdBy(): string {
    return isPlatformBrowser(this.platformId) ? (sessionStorage.getItem('email') ?? '') : '';
  }

  ngOnInit(): void {
    this.loadMenus();
  }

  loadMenus(): void {
    this.loading = true;
    this.errorMsg = '';

    forkJoin({
      menus: this.menuService.get({ flag: 'GET' }),
      access: this.menuAccessService.getById(this.roleAccessRequest()).pipe(
        catchError(() => of([]))
      ),
    }).subscribe({
      next: ({ menus, access }) => {
        const menuList = this.asArray(menus);
        const accessList = this.asArray(access);

        this.rows = menuList.map((menu) => ({
          menu,
          access: accessList.find((item) => this.isSameId(this.getMenuId(item), this.getMenuId(menu))) ?? null,
        }));

        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'Unable to load menu access.';
        this.cdr.markForCheck();
      },
    });
  }

  addAccess(row: MenuAccessRow): void {
    const menuId = this.getMenuId(row.menu);
    this.updatingMenuIds.add(menuId);
    this.errorMsg = '';

    this.menuAccessService.create({
      RoleId: this.roleId,
      roleId: this.roleId,
      RoleName: this.roleName,
      roleName: this.roleName,
      MenuId: menuId,
      menuId,
      created_By: this.createdBy,
    }).subscribe({
      next: () => {
        this.changed = true;
        this.updatingMenuIds.delete(menuId);
        this.loadMenus();
      },
      error: (err) => {
        this.updatingMenuIds.delete(menuId);
        this.errorMsg = err?.error?.message || 'Add access failed.';
        this.cdr.markForCheck();
      },
    });
  }

  removeAccess(row: MenuAccessRow): void {
    const menuId = this.getMenuId(row.menu);
    this.updatingMenuIds.add(menuId);
    this.errorMsg = '';

    this.menuAccessService.delete({
      id: this.getAccessId(row.access),
      menuAccessId: this.getAccessId(row.access),
      RoleId: this.roleId,
      roleId: this.roleId,
      RoleName: this.roleName,
      roleName: this.roleName,
      MenuId: menuId,
      menuId,
    }).subscribe({
      next: () => {
        this.changed = true;
        this.updatingMenuIds.delete(menuId);
        this.loadMenus();
      },
      error: (err) => {
        this.updatingMenuIds.delete(menuId);
        this.errorMsg = err?.error?.message || 'Remove access failed.';
        this.cdr.markForCheck();
      },
    });
  }

  close(): void {
    this.dialogRef?.close(this.changed);
  }

  isUpdating(row: MenuAccessRow): boolean {
    return this.updatingMenuIds.has(this.getMenuId(row.menu));
  }

  get roleId(): number | string {
    return this.dialogData?.p_role_id ?? this.dialogData?.roleId ?? this.dialogData?.RoleId ?? '';
  }

  get roleName(): string {
    return this.dialogData?.p_role_name ?? this.dialogData?.roleName ?? this.dialogData?.RoleName ?? this.dialogData?.name ?? '';
  }

  getMenuName(menu: any): string {
    return menu?.menuName ?? menu?.p_menu_name ?? menu?.name ?? '';
  }

  getParentMenu(menu: any): string {
    return menu?.parentMenuName ?? menu?.parent_MenuName ?? (menu?.parentMenuId ? String(menu.parentMenuId) : '-');
  }

  getRoute(menu: any): string {
    return menu?.routeUrl ?? menu?.route ?? '-';
  }

  private roleAccessRequest(): any {
    return {
      RoleId: this.roleId,
      roleId: this.roleId,
      p_role_id: this.roleId,
      RoleName: this.roleName,
      roleName: this.roleName,
      p_role_name: this.roleName,
    };
  }

  private getMenuId(menu: any): number | string {
    return menu?.menuId ?? menu?.MenuId ?? menu?.p_menu_id ?? menu?.P_Menu_Id ?? menu?.id ?? '';
  }

  private getAccessId(access: any): number | string {
    return access?.menuAccessId ?? access?.MenuAccessId ?? access?.accessId ?? access?.id ?? '';
  }

  private isSameId(left: number | string, right: number | string): boolean {
    return String(left) === String(right);
  }

  private asArray(value: any): any[] {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.data)) return value.data;
    if (Array.isArray(value?.result)) return value.result;
    if (Array.isArray(value?.items)) return value.items;
    return [];
  }
}
