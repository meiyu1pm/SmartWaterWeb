// src/app/core/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { StorageUtil, STORAGE_KEYS } from '../utils/storage.util';
import { environment } from '../../../environments/environment';

export interface LoginParams {
  username: string;
  password: string;
  remember?: boolean;
}

export interface UserInfo {
  id: number;
  username: string;
  displayName: string;
  avatar?: string;
  roles: string[];
}

export interface LoginResult {
  token: string;
  userInfo: UserInfo;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = `${environment.apiBaseUrl}/auth`;

  constructor(private http: HttpClient) {}

  /**
   * 登录
   */
  login(params: LoginParams): Observable<LoginResult> {
    // TODO: 后端接口完成后替换为真实接口
    // return this.http.post<LoginResult>(`${this.baseUrl}/login`, params).pipe(
    //   tap(res => this.setLoginState(res))
    // );
    
    // Mock登录逻辑
    return of({
      token: 'mock-jwt-token-' + Date.now(),
      userInfo: {
        id: 1,
        username: params.username,
        displayName: '管理员',
        roles: ['admin']
      }
    }).pipe(
      tap(res => this.setLoginState(res, params.remember))
    );
  }

  /**
   * 保存登录状态
   */
  private setLoginState(result: LoginResult, remember: boolean = false): void {
    StorageUtil.set(STORAGE_KEYS.TOKEN, result.token);
    StorageUtil.set(STORAGE_KEYS.USER_INFO, result.userInfo);
    StorageUtil.set(STORAGE_KEYS.REMEMBER_ME, remember);
  }

  /**
   * 获取Token
   */
  getToken(): string | null {
    return StorageUtil.get<string>(STORAGE_KEYS.TOKEN);
  }

  /**
   * 获取用户信息
   */
  getUserInfo(): UserInfo | null {
    return StorageUtil.get<UserInfo>(STORAGE_KEYS.USER_INFO);
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
  logout(): void {
    StorageUtil.remove(STORAGE_KEYS.TOKEN);
    StorageUtil.remove(STORAGE_KEYS.USER_INFO);
  }
}