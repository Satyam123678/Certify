import { Routes } from '@angular/router';
import { RegisterComponent } from './pages/auth/register-component/register-component';
import { authGuard } from './core/guards/auth.guard';

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
  },
  {
    path: 'logout',
    loadComponent: () => import('./pages/auth/logout/logout').then(m => m.Logout)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard-component/dashboard-component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'quizzes',
    loadComponent: () => import('./pages/quiz/quiz-list/quiz-list').then(m => m.QuizList),
    canActivate: [authGuard]
  },
  {
    path: 'quizzes/:id',
    loadComponent: () => import('./pages/quiz/quiz-play/quiz-play').then(m => m.QuizPlay),
    canActivate: [authGuard]
  },
  {
    path: 'quizzes/:id/result',
    loadComponent: () => import('./pages/quiz/quiz-result/quiz-result').then(m => m.QuizResult),
    canActivate: [authGuard]
  },
  {
    path:'quizzes/:category/leaderboard',
    loadComponent: () => import('./pages/quiz/leaderboard/leaderboard').then(m => m.Leaderboard),
    canActivate: [authGuard]
  }

];
