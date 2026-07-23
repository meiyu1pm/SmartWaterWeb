// src/app/core/error.interceptor.ts
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Router } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { catchError, switchMap, throwError, filter, take, Subject } from 'rxjs';

// 刷新令牌锁，防止并发请求重复触发刷新
let isRefreshing = false;
// 刷新令牌完成通知队列
const refreshTokenSubject: Subject<string | null> = new Subject();

export const errorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const message = inject(NzMessageService);
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMsg = '请求失败，请稍后重试';

      // 网络层错误
      if (error.error instanceof ErrorEvent) {
        errorMsg = `网络异常：${error.error.message}`;
        message.error(errorMsg);
        return throwError(() => error);
      }

      // HTTP 状态码处理
      switch (error.status) {
        case 401:
          // 登录、刷新接口本身返回401，直接登出，不再重试
          if (req.url.includes('/auth/login') || req.url.includes('/auth/refresh')) {
            authService.logout();
            router.navigate(['/login']);
            message.error('登录已失效，请重新登录');
            return throwError(() => error);
          }

          // 处理 Token 自动刷新
          return handle401Error(req, next, authService, router, message);

        case 403:
          errorMsg = '无权限访问该资源';
          break;
        case 404:
          errorMsg = '请求的接口不存在';
          break;
        case 500:
          errorMsg = '服务器内部错误，请联系管理员';
          break;
        default:
          // 兼容两种错误格式：优先 message，其次 detail
          const errBody = error.error;
          if (errBody?.message) {
            errorMsg = errBody.message;
          } else if (errBody?.detail) {
            errorMsg = errBody.detail;
          } else {
            errorMsg = error.message || `请求错误（状态码：${error.status}）`;
          }
      }

      message.error(errorMsg);
      return throwError(() => error);
    })
  );
};

/**
 * 处理 401 错误：刷新 Token 并重试原请求
 */
function handle401Error(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
  router: Router,
  message: NzMessageService
) {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    const refreshToken = authService.getRefreshToken();
    if (!refreshToken) {
      isRefreshing = false;
      authService.logout();
      router.navigate(['/login']);
      return throwError(() => new Error('无刷新令牌'));
    }

    return authService.refreshToken(refreshToken).pipe(
      switchMap((res) => {
        isRefreshing = false;
        authService.updateAccessToken(res.access_token);
        refreshTokenSubject.next(res.access_token);
        // 重试原请求
        return next(cloneRequestWithToken(req, res.access_token));
      }),
      catchError((err) => {
        isRefreshing = false;
        authService.logout();
        router.navigate(['/login']);
        message.error('登录已失效，请重新登录');
        return throwError(() => err);
      })
    );
  } else {
    // 正在刷新中，等待刷新完成后重试
    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => next(cloneRequestWithToken(req, token!)))
    );
  }
}

/**
 * 给请求克隆并添加新 Token
 */
function cloneRequestWithToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}