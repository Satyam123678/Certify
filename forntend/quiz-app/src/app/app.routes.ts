import { Routes } from '@angular/router';
import { RegisterComponent } from './pages/auth/register-component/register-component';

export const routes: Routes = [
    {
    path: 'register',
    component:RegisterComponent
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login').then(m => m.Login)
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'verify-otp',
    loadComponent: () => import('./pages/auth/verify-otp/verify-otp').then(m => m.VerifyOtp)
  }
];
