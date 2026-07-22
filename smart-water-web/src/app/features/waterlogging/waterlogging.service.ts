// src/app/features/waterlogging/waterlogging.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/models/api-response';
import { environment } from '../../../environments/environment';

// ============ 数据类型定义 ============

/** 内涝KPI指标 */
export interface WaterloggingKpi {
  title: string;
  value: string | number;
  unit: string;
  level: 'safe' | 'warning' | 'danger';
  icon: string;
}

/** 积水点信息 */
export interface PondingPoint {
  id: number;
  name: string;
  area: string;
  longitude: number;
  latitude: number;
  waterLevel: number; // 当前水深 cm
  warningLevel: number; // 警戒水深 cm
  riskLevel: 'safe' | 'warning' | 'danger';
  updateTime: string;
}

/** 降雨-水位-流量时序数据 */
export interface RiverFlowData {
  time: string;
  rainfall: number; // 降雨量 mm
  waterLevel: number; // 水位 m
  flow: number; // 流量 m³/s
}

/** 泵闸运行状态 */
export interface PumpStatus {
  id: number;
  name: string;
  type: 'pump' | 'gate'; // 泵站/闸门
  status: 'running' | 'stopped' | 'fault';
  openDegree: number; // 开度 %
  flow: number; // 排水流量 m³/h
  updateTime: string;
}

/** 内涝告警 */
export interface WaterloggingAlarm {
  id: number;
  title: string;
  level: 'blue' | 'yellow' | 'orange' | 'red'; // 蓝/黄/橙/红 四级预警
  area: string;
  position: string;
  publishTime: string;
  content: string;
  status: 'pending' | 'processing' | 'closed';
}

/** 调度预案 */
export interface DispatchPlan {
  id: number;
  title: string;
  level: string;
  content: string;
  suggestAction: string[];
}

@Injectable({ providedIn: 'root' })
export class WaterloggingService {
  private baseUrl = `${environment.apiBaseUrl}/waterlogging`;

  constructor(private http: HttpClient) {}

  /**
   * 获取内涝页面KPI指标
   */
  getKpiList(areaId: string = 'all'): Observable<ApiResponse<WaterloggingKpi[]>> {
    return this.http.get<ApiResponse<WaterloggingKpi[]>>(`${this.baseUrl}/kpi`, { params: { area: areaId } });
  }

  /**
   * 获取积水点列表
   */
  getPondingPoints(): Observable<ApiResponse<PondingPoint[]>> {
    return this.http.get<ApiResponse<PondingPoint[]>>(`${this.baseUrl}/ponding-points`);
  }

  /**
   * 获取24小时降雨-水位-流量数据
   */
  getRainTrendData(): Observable<ApiResponse<RiverFlowData[]>> {
    return this.http.get<ApiResponse<RiverFlowData[]>>(`${this.baseUrl}/rain-river-flow`);
  }

  /**
   * 获取泵闸运行状态列表
   */
  getPumpStatusList(): Observable<ApiResponse<PumpStatus[]>> {
    return this.http.get<ApiResponse<PumpStatus[]>>(`${this.baseUrl}/pump-status`);
  }

  /**
   * 获取内涝告警列表
   */
  getAlarmList(): Observable<ApiResponse<WaterloggingAlarm[]>> {
    return this.http.get<ApiResponse<WaterloggingAlarm[]>>(`${this.baseUrl}/alarms`);
  }

  /**
   * 获取推荐调度预案
   */
  getDispatchPlans(): Observable<ApiResponse<DispatchPlan[]>> {
    return this.http.get<ApiResponse<DispatchPlan[]>>(`${this.baseUrl}/dispatch-plans`);
  }
}