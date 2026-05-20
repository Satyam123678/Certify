import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/auth-service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Allow access only when a valid auth cookie is present.
  return authService.isLoggedIn()
    ? true
    : router.createUrlTree(['/login']);
};
