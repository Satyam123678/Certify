import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../service/auth-service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const isResetPasswordRequest = req.url.includes('/api/auth/forget/password');
  const resetToken = sessionStorage.getItem('reset_token');
  const token = isResetPasswordRequest ? resetToken : authService.getAuthToken();

  if (!token) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(authReq);
};
