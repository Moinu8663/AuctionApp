import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Login } from '../../Services/Login/login';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MenuAccessService } from '../../Services/MenuAccessService/menu-access-service';

export interface MenuItem {
  name: string;
  icon: string;
  route?: string;
  roles: string[];
  children?: MenuItem[];
}

@Component({
  selector: 'app-layout',
  imports: [RouterModule, MatMenuModule, MatIconModule, MatButtonModule, MatDividerModule],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  private readonly login = inject(Login);
  private readonly router = inject(Router);
  private readonly menuaccessservice = inject(MenuAccessService)

  isSidebarVisible = true;
  isMobileOpen = false;

  private get isMobile(): boolean {
    return typeof window !== 'undefined' && window.innerWidth <= 768;
  }
  username = '';
  role = '';

  menus: MenuItem[] = [];

  expandedMenus = new Set<string>();

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.username = sessionStorage.getItem('name') || 'User';
      this.role = sessionStorage.getItem('role') || '';
    }
    this.GetRoleMenu();
  }

  hasRole(allowedRoles: string[]): boolean {
    return allowedRoles.includes(this.role);
  }

  toggleExpand(name: string): void {
    this.expandedMenus.has(name)
      ? this.expandedMenus.delete(name)
      : this.expandedMenus.add(name);
  }

  isExpanded(name: string): boolean {
    return this.expandedMenus.has(name);
  }

  toggleSidebar() {
    if (this.isMobile) {
      this.isMobileOpen = !this.isMobileOpen;
    } else {
      this.isSidebarVisible = !this.isSidebarVisible;
    }
  }

  GetRoleMenu(){
    this.menuaccessservice.getById({ RoleName: this.role}).subscribe({
      next: (res) => { 
      const parentMenus = res
        .filter((x: any) => x.parentMenuId === 0)
        .map((parent: any) => {

          const children = res
            .filter((c: any) => c.parentMenuId === parent.menuId)
            .map((child: any) => ({
              name: child.menuName,
              icon: child.icon,
              route: child.routeUrl,
              roles: [child.roleName]
            }));

          return {
            name: parent.menuName,
            icon: parent.icon,
            route: parent.routeUrl,
            roles: [parent.roleName],
            children: children.length > 0 ? children : undefined
          };
        });

      this.menus = parentMenus;
       },
      error: (err) => {  },
    });
  }

  closeMobileSidebar() { this.isMobileOpen = false; }
  Logout() { this.login.logout(); }
  profile() { this.router.navigate(['/profile']); }
}
