import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
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
   * 当前返回Mock数据，对接后端时替换为http请求
   */
  getOverviewKpi(): Observable<ApiResponse<OverviewKpiItem[]>> {
    // 后续替换为：return this.http.get<ApiResponse<OverviewKpiItem[]>>(`${this.baseUrl}/overview-kpi`);
    return of({
      code: 0,
      message: 'success',
      trace_id: 'mock-dashboard-kpi-001',
      data: [
        { title: '今日总供水量', value: '3286.5', unit: 'm³', color: '#1677ff', trend: '+2.3%' },
        { title: '今日总用水量', value: '2954.2', unit: 'm³', color: '#52c41a', trend: '+1.8%' },
        { title: '全网平均漏损率', value: '10.12', unit: '%', color: '#faad14', trend: '-0.5%' },
        { title: '活跃监测点位', value: '128', unit: '个', color: '#722ed1', trend: '+6' }
      ]
    });
  }

  /**
   * 获取全网24小时总流量数据
   */
  getTotalFlowData(): Observable<ApiResponse<FlowDataItem[]>> {
    const data = Array.from({ length: 24 }, (_, i) => ({
      time: `${i.toString().padStart(2, '0')}:00`,
      value: 120 + Math.random() * 50 + Math.sin(i / 4) * 25
    }));

    return of({
      code: 0,
      message: 'success',
      trace_id: 'mock-dashboard-flow-001',
      data
    });
  }

  /**
   * 获取最新告警列表
   */
  getLatestAlarms(): Observable<ApiResponse<AlarmItem[]>> {
    return of({
      code: 0,
      message: 'success',
      trace_id: 'mock-dashboard-alarm-001',
      data: [
        { time: '10分钟前', area: '经开6分区', content: 'FT-007流量计流量突变告警', level: 'error' },
        { time: '32分钟前', area: '纬二路片区', content: 'PT-012压力计压力骤降', level: 'warning' },
        { time: '1小时前', area: '钻石花园DMA', content: '夜间流量持续偏高', level: 'warning' },
        { time: '2小时前', area: '三级管网9区', content: '设备通信恢复正常', level: 'success' },
        { time: '3小时前', area: '朗诗东山樾', content: '水质浊度指标异常', level: 'warning' }
      ]
    });
  }
}
