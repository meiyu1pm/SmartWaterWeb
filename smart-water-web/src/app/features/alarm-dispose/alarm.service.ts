// src/app/features/alarm-dispose/alarm.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/models/api-response';
import { environment } from '../../../environments/environment';

// ============ 类型定义 ============
export interface AlarmKpi {
  title: string;
  value: string;
  unit: string;
  color: string;
}

export interface AlarmItem {
  id: number;
  alarmNo: string;
  title: string;
  type: 'leakage' | 'waterlogging' | 'quality' | 'device';
  level: 'blue' | 'yellow' | 'orange' | 'red';
  source: string;
  location: string;
  description: string;
  status: 'pending' | 'processing' | 'handled' | 'closed';
  handler?: string;
  createTime: string;
  updateTime: string;
}

export interface DisposeRecord {
  id: number;
  alarmId: number;
  action: 'confirm' | 'dispatch' | 'process' | 'close';
  operator: string;
  remark: string;
  createTime: string;
}

export interface DisposeRequest {
  action: 'confirm' | 'dispatch' | 'process' | 'close';
  remark?: string;
  handler?: string;
}

@Injectable({ providedIn: 'root' })
export class AlarmService {
  private baseUrl = `${environment.apiBaseUrl}/alarms`;

  constructor(private http: HttpClient) {}

  // 获取告警KPI统计
  getKpi(): Observable<ApiResponse<AlarmKpi[]>> {
    return this.http.get<ApiResponse<AlarmKpi[]>>(`${this.baseUrl}/kpi`);
  }

  // 获取告警列表（支持筛选分页）
  getAlarmList(params: {
    keyword?: string;
    type?: string;
    level?: string;
    status?: string;
    pageIndex?: number;
    pageSize?: number;
  }): Observable<ApiResponse<{ list: AlarmItem[]; total: number }>> {
    return this.http.get<ApiResponse<{ list: AlarmItem[]; total: number }>>(this.baseUrl, { params });
  }

  // 获取告警详情
  getAlarmDetail(id: number): Observable<ApiResponse<AlarmItem>> {
    return this.http.get<ApiResponse<AlarmItem>>(`${this.baseUrl}/${id}`);
  }

  // 获取处置记录
  getDisposeRecords(id: number): Observable<ApiResponse<DisposeRecord[]>> {
    return this.http.get<ApiResponse<DisposeRecord[]>>(`${this.baseUrl}/${id}/records`);
  }

  // 处置告警
  disposeAlarm(id: number, data: DisposeRequest): Observable<ApiResponse<AlarmItem>> {
    return this.http.post<ApiResponse<AlarmItem>>(`${this.baseUrl}/${id}/dispose`, data);
  }
}