import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/models/api-response';
import { environment } from '../../../environments/environment';

// 数据类型定义
export interface OverviewKpiItem {
  title: string;
  value: string;
  unit: string;
  color: string;
  trend: string;
}

export interface FlowDataItem {
  time: string;
  value: number;
}

export interface AlarmItem {
  time: string;
  area: string;
  content: string;
  level: 'success' | 'warning' | 'error';
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private baseUrl = `${environment.apiBaseUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  /**
   * 获取全局概览KPI
   */
  getOverviewKpi(): Observable<ApiResponse<OverviewKpiItem[]>> {
    return this.http.get<ApiResponse<OverviewKpiItem[]>>(`${this.baseUrl}/overview-kpi`);
  }

  /**
   * 获取全网24小时总流量数据
   */
  getTotalFlowData(): Observable<ApiResponse<FlowDataItem[]>> {
    return this.http.get<ApiResponse<FlowDataItem[]>>(`${this.baseUrl}/flow-trend`);
  }

  /**
   * 获取最新告警列表
   */
  getLatestAlarms(): Observable<ApiResponse<AlarmItem[]>> {
    return this.http.get<ApiResponse<AlarmItem[]>>(`${this.baseUrl}/latest-alarms`);
  }
}