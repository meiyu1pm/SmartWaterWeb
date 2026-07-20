import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/models/api-response';
import { environment } from '../../../environments/environment';

// 登录请求参数类型
export interface LoginRequest {
  username: string;
  password: string;
}

// 登录返回数据类型
export interface LoginResult {
  access_token: string;
  token_type: string;
  expires_in: number;
}

const TOKEN_KEY = 'access_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = `${environment.apiBaseUrl}/auth`;

  constructor(private http: HttpClient) {}

  /**
   * 调用后端登录接口
   */
  login(payload: LoginRequest): Observable<ApiResponse<LoginResult>> {
    return this.http.post<ApiResponse<LoginResult>>(
      `${this.baseUrl}/login`,
      payload
    );
  }

  /**
   * 保存token到浏览器本地存储
   */
  saveToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  /**
   * 从本地读取token
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * 判断是否已登录
   */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /**
   * 退出登录，清除本地token
   */
  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
  }
}
