import { Routes } from '@angular/router';
import HomeComponent from './features/home/home.component';
import MainComponent from './layouts/main/main.component';
import { authGuard } from './core/guard/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component'),
  },
  {
    path: '',
    component: MainComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        loadComponent: () => import('./features/home/home.component'),
        title: 'Trang chủ',
      },
    ],
  },
];
