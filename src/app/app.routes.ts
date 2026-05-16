import { Routes } from '@angular/router';
import { authGuard } from './Services/Auth/auth-guard';
import { roleGuard } from './Services/Role/role-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  {
    path: 'login',
    loadComponent: () => import('./Component/login/login').then(m => m.Login)
  },

  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./Component/layout/layout').then(m => m.Layout),
    children: [
      {
        path: 'home',
        canActivate: [roleGuard],
        data: { roles: ['Admin', 'User', 'SuperAdmin'] },
        loadComponent: () => import('./Component/home/home').then(m => m.Home)
      },
      {
        path: 'dashboard',
        canActivate: [roleGuard],
        data: { roles: ['Admin', 'User', 'SuperAdmin'] },
        loadComponent: () => import('./Component/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'profile',
        canActivate: [roleGuard],
        data: { roles: ['Admin', 'User', 'SuperAdmin'] },
        loadComponent: () => import('./Component/profile/profile').then(m => m.Profile)
      },
      {
        path: 'adminpanel',
        canActivate: [roleGuard],
        data: { roles: ['SuperAdmin'] },
        loadComponent: () => import('./Component/admin-panel/admin-panel').then(m => m.AdminPanel)
      },
      {
        path: 'team-panel',
        canActivate: [roleGuard],
        data: { roles: ['SuperAdmin', 'Admin'] },
        loadComponent: () => import('./Component/team-panel/team-panel').then(m => m.TeamPanel)
      },
      {
        path: 'player-panel',
        canActivate: [roleGuard],
        data: { roles: ['SuperAdmin', 'Admin'] },
        loadComponent: () => import('./Component/player-panel/player-panel').then(m => m.PlayerPanel)
      },
      {
        path: 'auction-panel',
        canActivate: [roleGuard],
        data: { roles: ['SuperAdmin', 'Admin'] },
        loadComponent: () => import('./Component/auction-panel/auction-panel').then(m => m.AuctionPanel)
      },
      {
        path: 'menu-access-panel',
        canActivate: [roleGuard],
        data: { roles: ['SuperAdmin'] },
        loadComponent: () => import('./Component/menu-access-panel/menu-access-panel').then(m => m.MenuAccessPanel)
      },
      {
        path: 'menu-panel',
        canActivate: [roleGuard],
        data: { roles: ['SuperAdmin'] },
        loadComponent: () => import('./Component/menu-panel/menu-panel').then(m => m.MenuPanel)
      },
    ]
  }
];
