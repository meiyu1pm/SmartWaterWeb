// src/app/core/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { StorageUtil, STORAGE_KEYS } from '../utils/storage.util';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';


export interface LoginParams {
  username: string;
  password: string;
  remember?: boolean;
}

export interface UserInfo {
  id: number;
  username: string;
  displayName: string;  // 从 display_name 改为 displayName，对齐后端
  status?: string;      // 改为可选，后端暂未返回也不报错
  roles: string[];
  permissions?: string[]; // 改为可选
}

export interface LoginResult {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: UserInfo;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = `${environment.apiBaseUrl}/auth`;

  constructor(private http: HttpClient) {}

  /**
   * 登录
   */
  login(params: LoginParams): Observable<LoginResult> {
    return this.http.post<{
      code: number;
      message: string;
      data: LoginResult;
      trace_id: string
    }>(`${this.baseUrl}/login`, params).pipe(
      //从后端统一相应包络中提取业务数据
      map(res => res.data),
      tap(res => this.setLoginState(res, params.remember))
    );
  }

  /**
   * 刷新Token
   */
  refreshToken(refreshToken: string): Observable<LoginResult> {
    return this.http.post<{ code: number; message: string; data: LoginResult; trace_id: string }>(
      `${this.baseUrl}/refresh`, 
      { refresh_token: refreshToken }
    ).pipe(
      map(res => res.data),
      tap(res => this.setLoginState(res))
    )
  }

  /**
   * 获取当前登录用户信息
   */
  getCurrentUser(): Observable<UserInfo> {
    return this.http.get<{ code: number; message: string; data: UserInfo; trace_id: string }>(
      `${this.baseUrl}/me`
    ).pipe(
      map(res => res.data)
    );
  }

  /**
   * 保存登录状态
   */
  private setLoginState(result: LoginResult, remember: boolean = false): void {
    StorageUtil.set(STORAGE_KEYS.TOKEN, result.access_token);
    StorageUtil.set(STORAGE_KEYS.REFRESH_TOKEN, result.refresh_token);
    StorageUtil.set(STORAGE_KEYS.USER_INFO, result.user);
    StorageUtil.set(STORAGE_KEYS.REMEMBER_ME, remember);
  }

  /**
   * 更新Access Token（拦截器刷新后调用）
   */
  updateAccessToken(token: string): void {
    StorageUtil.set(STORAGE_KEYS.TOKEN, token);
  }

  /**
   * 获取Access Token
   */
  getToken(): string | null {
    return StorageUtil.get<string>(STORAGE_KEYS.TOKEN);
  }

  /**
   * 获取Refresh Token
   */
  getRefreshToken(): string | null {
    return StorageUtil.get<string>(STORAGE_KEYS.REFRESH_TOKEN);
  }

  /**
   * 获取用户信息
   */
  getUserInfo(): UserInfo | null {
    return StorageUtil.get<UserInfo>(STORAGE_KEYS.USER_INFO);
  }

  /**
   * 获取用户权限列表
   */
  getPermissions(): string[] {
    const user = this.getUserInfo();
    return user?.permissions || [];
  }

  /**
   * 判断是否已登录
   */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /**
   * 登出
   */
  logout(): Observable<void> {
    const refreshToken = this.getRefreshToken();
    // 有刷新令牌则调用后端登出，作废令牌
    if (refreshToken) {
      return this.http.post<{ code: number; message: string; data: { logged_out: boolean }; trace_id: string }>(
        `${this.baseUrl}/logout`,
        { refresh_token: refreshToken }
      ).pipe(
        tap(() => this.clearLocalState()),
        map(() => void 0)
      );
    }
    // 无令牌直接清理本地
    return of(void 0).pipe(tap(() => this.clearLocalState()));
  }

  /**
   * 清理本地登录状态
   */
  private clearLocalState(): void {
    StorageUtil.remove(STORAGE_KEYS.TOKEN);
    StorageUtil.remove(STORAGE_KEYS.REFRESH_TOKEN);
    StorageUtil.remove(STORAGE_KEYS.USER_INFO);
  }
}