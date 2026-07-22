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

export interface TaskItem {
  id: string;
  name: string;
  scenario: string;
  status: 'running' | 'success' | 'failed';
  progress: number;
  startTime: string;
}

export interface RealtimeMonitorData {
  data: FlowDataItem[];
  thresholds: { upper: number; lower: number };
  markPoints: { time: string; value: number }[];
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
        { title: '接入监测点总数', value: '128', unit: '个', color: '#1677ff', trend: '+6' },
        { title: '今日告警数量', value: '7', unit: '条', color: '#f5222d', trend: '+2' },
        { title: '数据质量平均分', value: '92.6', unit: '分', color: '#52c41a', trend: '+1.2' },
        { title: '运行中任务数', value: '4', unit: '个', color: '#722ed1', trend: '-1' }
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

  /**
   * 获取实时时序监控数据（含阈值与异常点）
   * 当前用定时器模拟 WebSocket 秒级刷新，后续可替换为 WebSocket 服务
   */
  getRealtimeMonitorData(metricType: 'flow' | 'pressure'): Observable<ApiResponse<RealtimeMonitorData>> {
    const isFlow = metricType === 'flow';
    const base = isFlow ? 120 : 0.28;
    const amplitude = isFlow ? 40 : 0.08;
    const thresholds = isFlow
      ? { upper: 160, lower: 90 }
      : { upper: 0.38, lower: 0.20 };

    const data = Array.from({ length: 60 }, (_, i) => {
      const second = i; // 最近 60 秒
      const time = `${Math.floor(second / 60).toString().padStart(2, '0')}:${(second % 60).toString().padStart(2, '0')}`;
      const value = base + Math.random() * amplitude + Math.sin(second / 10) * (amplitude / 3);
      return { time, value: Math.round(value * 100) / 100 };
    });

    // 随机生成 2~3 个超出阈值的异常点
    const markPoints = data
      .filter((_, i) => i % 17 === 0)
      .slice(0, 3)
      .map(item => ({
        time: item.time,
        value: item.value > thresholds.upper ? item.value + 5 : item.value - 5
      }));

    return of({
      code: 0,
      message: 'success',
      trace_id: 'mock-dashboard-realtime-001',
      data: { data, thresholds, markPoints }
    });
  }

  /**
   * 获取任务运行状态列表
   */
  getTaskList(): Observable<ApiResponse<TaskItem[]>> {
    return of({
      code: 0,
      message: 'success',
      trace_id: 'mock-dashboard-task-001',
      data: [
        { id: 'T20260722001', name: '漏损分析任务-06:00', scenario: '供水管网漏损', status: 'running', progress: 68, startTime: '2026-07-22 06:00' },
        { id: 'T20260722002', name: '数据质量评估', scenario: '全局数据质量', status: 'success', progress: 100, startTime: '2026-07-22 05:30' },
        { id: 'T20260722003', name: '夜间最小流量分析', scenario: '供水管网漏损', status: 'failed', progress: 45, startTime: '2026-07-22 05:00' },
        { id: 'T20260722004', name: '异常检测推理', scenario: '供水管网漏损', status: 'running', progress: 32, startTime: '2026-07-22 06:30' }
      ]
    });
  }
}
