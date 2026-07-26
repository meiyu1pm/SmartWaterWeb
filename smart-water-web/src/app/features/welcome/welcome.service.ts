import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/models/api-response';
import { environment } from '../../../environments/environment';


/** 欢迎页数据结构，与后端接口对齐 */
export interface WelcomeData {
  platform_name: string;
  welcome_text: string;
  current_time: string;
  user_role: string;
  module_count: number;
}


@Injectable({ providedIn: 'root' })
export class WelcomeService {
  private readonly baseUrl = `${environment.apiBaseUrl}/welcome`;

  constructor(private http: HttpClient) {}

  /**
   * 获取欢迎页基础信息
   * GET /api/v1/welcome
   */
  getWelcomeInfo(): Observable<ApiResponse<WelcomeData>> {
    return this.http.get<ApiResponse<WelcomeData>>(this.baseUrl);
  }
}