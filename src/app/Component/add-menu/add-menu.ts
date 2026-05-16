import { isPlatformBrowser, NgTemplateOutlet } from '@angular/common';
import { Component, PLATFORM_ID, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MenuService } from '../../Services/MenuService/menu-service';

@Component({
  selector: 'app-add-menu',
  imports: [
    NgTemplateOutlet,
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
  ],
  templateUrl: './add-menu.html',
  styleUrl: './add-menu.css',
})
export class AddMenu {
  private readonly fb = inject(FormBuilder);
  private readonly menuService = inject(MenuService);
  private readonly platformId = inject(PLATFORM_ID);

  dialogRef = inject(MatDialogRef<AddMenu>, { optional: true });
  dialogData = inject<any>(MAT_DIALOG_DATA, { optional: true });

  isEdit = this.dialogData?.mode === 'edit';
  isDelete = this.dialogData?.mode === 'delete';
  loading = false;
  loadingMenus = false;
  errorMsg = '';
  parentMenus: any[] = [];

  form = this.fb.group({
    menuName: [this.dialogData?.menuName ?? this.dialogData?.p_menu_name ?? '', [Validators.required, Validators.minLength(2)]],
    icon: [this.dialogData?.icon ?? 'menu', Validators.required],
    routeUrl: [this.dialogData?.routeUrl ?? this.dialogData?.route ?? ''],
    parentMenuId: [this.dialogData?.parentMenuId ?? this.dialogData?.ParentMenuId ?? 0],
    displayOrder: [this.dialogData?.displayOrder ?? this.dialogData?.DisplayOrder ?? 0, [Validators.required, Validators.min(0)]],
    isActive: [this.dialogData?.isActive ?? this.dialogData?.IsActive ?? true],
  });

  private get createdBy(): string {
    return isPlatformBrowser(this.platformId) ? (sessionStorage.getItem('email') ?? '') : '';
  }

  ngOnInit(): void {
    if (!this.isDelete) {
      this.loadParentMenus();
    }
  }

  get f() { return this.form.controls; }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.errorMsg = '';

    const value = this.form.getRawValue();
    const payload = {
      ...value,
      parentMenuId: Number(value.parentMenuId) || 0,
      displayOrder: Number(value.displayOrder) || 0,
      IsActive: value.isActive,
      created_By: this.createdBy,
    };

    const api$ = this.isEdit ? this.menuService.update(payload) : this.menuService.create(payload);

    api$.subscribe({
      next: () => {
        this.loading = false;
        this.dialogRef?.close(true);
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'Operation failed.';
      },
    });
  }

  onDelete(): void {
    this.loading = true;
    this.errorMsg = '';

    this.menuService.delete({
      id: this.menuId,
      menuId: this.menuId,
      MenuId: this.menuId,
    }).subscribe({
      next: () => {
        this.loading = false;
        this.dialogRef?.close(true);
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'Delete failed.';
      },
    });
  }

  getMenuName(menu: any): string {
    return menu?.menuName ?? menu?.p_menu_name ?? menu?.name ?? '';
  }

  get menuName(): string {
    return this.getMenuName(this.dialogData);
  }

  private loadParentMenus(): void {
    this.loadingMenus = true;

    this.menuService.get({ flag: 'GET' }).subscribe({
      next: (res) => {
        const currentMenuId = this.menuId;
        this.parentMenus = (Array.isArray(res) ? res : []).filter((menu) => this.getMenuId(menu) !== currentMenuId);
        this.loadingMenus = false;
      },
      error: () => {
        this.parentMenus = [];
        this.loadingMenus = false;
      },
    });
  }

  private get menuId(): number | string {
    return this.getMenuId(this.dialogData);
  }

  private getMenuId(menu: any): number | string {
    return menu?.menuId ?? menu?.MenuId ?? menu?.p_menu_id ?? menu?.id ?? '';
  }
}
