import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./home/home').then(m => m.HomeComponent) },
  { path: 'game', loadComponent: () => import('./game/game').then(m => m.GameComponent) },
  { path: 'compare', loadComponent: () => import('./compare/compare').then(m => m.CompareComponent) },
  { path: 'end', loadComponent: () => import('./end/end').then(m => m.EndComponent) },
  { path: '**', redirectTo: '' },
];
