import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ApiResponse } from '../../shared/models/api-response';
import { environment } from '../../../environments/environment';

// 数据类型定义
export interface KpiItem {
  title: string;
  value: string;
  unit: string;
  color: string;
}

export interface AreaRiskItem {
  name: string;
  level: 'high' | 'medium' | 'low';
  leakRate: string;
}

export interface AnomalyItem {
  time: string;
  point: string;
  score: number;
  type: string;
}

export interface FlowDataItem {
  time: string;
  value: number;
}

@Injectable({ providedIn: 'root' })
export class LeakageService {
  private baseUrl = `${environment.apiBaseUrl}/leakage`;

  constructor(private http: HttpClient) {}

  /**
   * 获取漏损页面顶部KPI指标
   */
  getKpiList(areaId: string = 'all'): Observable<ApiResponse<KpiItem[]>> {
    return this.http.get<ApiResponse<KpiItem[]>>(`${this.baseUrl}/kpi`,{
      params: {areaId}
    });
  }

  /**
   * 获取分区风险概览
   */
  getAreaRiskList(): Observable<ApiResponse<AreaRiskItem[]>> {
    return this.http.get<ApiResponse<AreaRiskItem[]>>(`${this.baseUrl}/area-risk`);
  }

  // 获取24小时流量趋势
  getFlowTrendData(): Observable<ApiResponse<FlowDataItem[]>> {
    return this.http.get<ApiResponse<FlowDataItem[]>>(`${this.baseUrl}/flow-trend`);;
  }

  // 获取漏损异常点列表
  getAnomalyList(): Observable<ApiResponse<AnomalyItem[]>> {
    return this.http.get<ApiResponse<AnomalyItem[]>>(`${this.baseUrl}/anomalies`);
  }

  /**
   * 获取夜间最小流量趋势
   */
  getNightFlowData(): Observable<ApiResponse<FlowDataItem[]>> {
    return this.http.get<ApiResponse<FlowDataItem[]>>(`${this.baseUrl}/night-flow`);
  }
}
