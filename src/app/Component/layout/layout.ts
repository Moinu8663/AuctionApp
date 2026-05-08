import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Login } from '../../Services/Login/login';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

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

  isSidebarVisible = true;
  isMobileOpen = false;

  private get isMobile(): boolean {
    return typeof window !== 'undefined' && window.innerWidth <= 768;
  }
  username = '';
  role = '';

  menus: MenuItem[] = [
    { name: 'Home', icon: '🏠', route: '/home', roles: ['SuperAdmin', 'Admin', 'User'] },
    {
      name: 'Management', icon: '⚙️', roles: ['SuperAdmin', 'Admin'],
      children: [
        { name: 'Admin Panel',   icon: '🛡️', route: '/adminpanel',    roles: ['SuperAdmin'] },
        { name: 'Auction Panel', icon: '🔨', route: '/auction-panel', roles: ['SuperAdmin', 'Admin'] },
        { name: 'Team Panel',    icon: '🏏', route: '/team-panel',    roles: ['SuperAdmin', 'Admin'] },
        { name: 'Player Panel',  icon: '🧑', route: '/player-panel',  roles: ['SuperAdmin', 'Admin'] },
      ]
    },
    { name: 'My Bids', icon: '💰', route: '/my-bids', roles: ['User'] },
  ];

  expandedMenus = new Set<string>();

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.username = sessionStorage.getItem('email') || 'User';
      this.role = sessionStorage.getItem('role') || '';
    }
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

  closeMobileSidebar() { this.isMobileOpen = false; }
  Logout() { this.login.logout(); }
  profile() { this.router.navigate(['/profile']); }
}
