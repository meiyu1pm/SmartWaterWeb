//全局异常拦截器
//所有发往后端的接口请求，只要报错，都统一弹出提示
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Router } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { catchError, throwError } from 'rxjs';

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

      // 1. 网络层错误（后端未启动、跨域、断网）
      if (error.error instanceof ErrorEvent) {
        errorMsg = `网络异常：${error.error.message}`;
      } 
      // 2. HTTP 状态码错误
      else {
        switch (error.status) {
          case 401:
            errorMsg = '登录已失效，请重新登录';
            authService.logout(); // 清除本地 token
            router.navigate(['/login']);
            break;
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
            errorMsg = error.message || `请求错误（状态码：${error.status}）`;
        }
      }

      // 统一弹出错误提示
      message.error(errorMsg);
      // 把错误继续抛出去，页面里可以做额外处理
      return throwError(() => error);
    })
  );
};
