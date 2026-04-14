import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./home/home').then(m => m.HomeComponent) },
  { path: 'game', loadComponent: () => import('./game/game').then(m => m.GameComponent) },
  { path: 'game/:countryCode', loadComponent: () => import('./game/game').then(m => m.GameComponent) },
  { path: 'create', loadComponent: () => import('./create/create').then(m => m.CreateComponent) },
  { path: 'compare', loadComponent: () => import('./compare/compare').then(m => m.CompareComponent) },
  { path: 'end', loadComponent: () => import('./end/end').then(m => m.EndComponent) },
  { path: '**', redirectTo: '' },
];
