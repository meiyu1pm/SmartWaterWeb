import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 已登录，放行
  if (authService.isLoggedIn()) {
    return true;
  }

  // 未登录，跳转到登录页
  router.navigate(['/login']);
  return false;
};
