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

export interface FlowSeriesItem {
  name: string;
  data: FlowDataItem[];
  color: string;
  lineType: 'solid' | 'dashed';
}

@Injectable({ providedIn: 'root' })
export class LeakageService {
  private baseUrl = `${environment.apiBaseUrl}/leakage`;

  constructor(private http: HttpClient) {}

  /**
   * 获取漏损页面顶部KPI指标
   * 当前返回Mock数据，后续对接后端时替换为http请求
   */
  getKpiList(areaId: string = 'all'): Observable<ApiResponse<KpiItem[]>> {
    // 后续替换为：return this.http.get<ApiResponse<KpiItem[]>>(`${this.baseUrl}/kpi`, { params: { areaId } });
    const isAll = areaId === 'all';
    return of({
      code: 0,
      message: 'success',
      trace_id: 'mock-leakage-kpi-001',
      data: [
        { title: '总供水量', value: isAll ? '3286.5' : '856.3', unit: 'm³', color: '#1677ff' },
        { title: '总用水量', value: isAll ? '2954.2' : '798.5', unit: 'm³', color: '#52c41a' },
        { title: '漏损率', value: isAll ? '10.12' : '6.74', unit: '%', color: '#faad14' },
        { title: '高风险分区数', value: isAll ? '3' : '1', unit: '个', color: '#f5222d' },
        { title: '未处置告警数', value: isAll ? '5' : '2', unit: '条', color: '#faad14' },
        { title: '模型评分', value: isAll ? '87.5' : '91.2', unit: '分', color: '#722ed1' }
      ]
    });
  }

  /**
   * 获取分区风险概览
   */
  getAreaRiskList(): Observable<ApiResponse<AreaRiskItem[]>> {
    // 后续替换为：return this.http.get<ApiResponse<AreaRiskItem[]>>(`${this.baseUrl}/area-risk`);
    return of({
      code: 0,
      message: 'success',
      trace_id: 'mock-leakage-risk-001',
      data: [
        { name: '经开6分区', level: 'high', leakRate: '12.8%' },
        { name: '纬二路片区', level: 'medium', leakRate: '8.5%' },
        { name: '钻石花园DMA', level: 'high', leakRate: '15.2%' },
        { name: '三级管网9区', level: 'low', leakRate: '3.6%' },
        { name: '朗诗东山樾', level: 'medium', leakRate: '7.1%' },
        { name: '城北新城片区', level: 'low', leakRate: '4.2%' }
      ]
    });
  }

  /**
   * 获取24小时流量趋势
   */
  getFlowTrendData(): Observable<ApiResponse<FlowDataItem[]>> {
    // 后续替换为：return this.http.get<ApiResponse<FlowDataItem[]>>(`${this.baseUrl}/flow-trend`);
    const data = Array.from({ length: 24 }, (_, i) => ({
      time: `${i.toString().padStart(2, '0')}:00`,
      value: Math.round((120 + Math.random() * 50 + Math.sin(i / 4) * 25) * 100) / 100
    }));

    return of({
      code: 0,
      message: 'success',
      trace_id: 'mock-leakage-flow-001',
      data
    });
  }

  /**
   * 获取流量/压力多指标叠加趋势（Mock，后续替换真实接口）
   */
  getFlowPressureTrendData(): Observable<ApiResponse<FlowSeriesItem[]>> {
    const times = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
    const flowData = times.map(time => ({
      time,
      value: Math.round((80 + Math.random() * 30 + Math.sin(parseInt(time) / 3) * 10) * 100) / 100
    }));
    const pressureData = times.map(time => ({
      time,
      value: Math.round((0.25 + Math.random() * 0.15 + Math.cos(parseInt(time) / 4) * 0.05) * 100) / 100
    }));

    return of({
      code: 0,
      message: 'success',
      trace_id: 'mock-leakage-flow-pressure-001',
      data: [
        { name: '流量(m³/h)', data: flowData, color: '#1677ff', lineType: 'solid' },
        { name: '压力(MPa)', data: pressureData, color: '#52c41a', lineType: 'dashed' }
      ]
    });
  }

  /**
   * 获取漏损异常点列表
   */
  getAnomalyList(): Observable<ApiResponse<AnomalyItem[]>> {
    // 后续替换为：return this.http.get<ApiResponse<AnomalyItem[]>>(`${this.baseUrl}/anomalies`);
    return of({
      code: 0,
      message: 'success',
      trace_id: 'mock-leakage-anomaly-001',
      data: [
        { time: '2026-07-22 02:15', point: 'FT-007', score: 0.92, type: '夜间流量异常' },
        { time: '2026-07-22 01:30', point: 'PT-012', score: 0.85, type: '压力骤降' },
        { time: '2026-07-21 23:45', point: 'FT-031', score: 0.78, type: '流量突变' },
        { time: '2026-07-21 22:10', point: 'FT-018', score: 0.71, type: '夜间流量异常' },
        { time: '2026-07-21 21:50', point: 'PT-005', score: 0.66, type: '压力波动' }
      ]
    });
  }

  /**
   * 获取夜间最小流量趋势
   */
  getNightFlowData(): Observable<ApiResponse<FlowDataItem[]>> {
    // 后续替换为：return this.http.get<ApiResponse<FlowDataItem[]>>(`${this.baseUrl}/night-flow`);
    const data = Array.from({ length: 24 }, (_, i) => ({
      time: `${i.toString().padStart(2, '0')}:00`,
      value: Math.round((15 + Math.random() * 10 + Math.sin(i / 6) * 5) * 100) / 100
    }));

    return of({
      code: 0,
      message: 'success',
      trace_id: 'mock-leakage-night-001',
      data
    });
  }
}
