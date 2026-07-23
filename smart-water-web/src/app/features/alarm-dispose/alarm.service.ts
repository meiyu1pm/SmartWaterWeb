import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/models/api-response';
import { environment } from '../../../environments/environment';

/* ============ 数据类型定义 ============ */
/** 告警KPI指标 */
export interface AlarmKpiItem {
  title: string;
  value: string;
  unit: string;
  color: string;
}

/** 告警列表项 */
export interface AlarmItem {
  id: number;
  alarmNo: string;
  title: string;
  type: string;
  level: string;
  source: string;
  location: string;
  description: string;
  status: string;
  handler: string | null;
  createTime: string;
  updateTime: string;
}

/** 处置记录 */
export interface AlarmDisposeRecord {
  id: number;
  alarmId: number;
  action: string;
  operator: string;
  remark: string;
  createTime: string;
}

/** 处置请求 */
export interface DisposeRequest {
  action: string;
  remark?: string;
  handler?: string;
}

/** 分页结果 */
export interface PageResult<T> {
  list: T[];
  total: number;
}

/** 查询参数 */
export interface AlarmQueryParams {
  keyword?: string;
  type?: string;
  level?: string;
  status?: string;
  pageIndex: number;
  pageSize: number;
}

/** 兼容旧组件导入名 */
export type AlarmKpi = AlarmKpiItem;
export type DisposeRecord = AlarmDisposeRecord;


@Injectable({ providedIn: 'root' })
export class AlarmService {
  private baseUrl = `${environment.apiBaseUrl}/alarms`;

  constructor(private http: HttpClient) {}

  /* ============ 接口方法 ============ */
  /**
   * 获取告警KPI统计
   * GET /api/v1/alarms/kpi
   */
  getKpi(): Observable<ApiResponse<AlarmKpiItem[]>> {
    return this.http.get<ApiResponse<AlarmKpiItem[]>>(`${this.baseUrl}/kpi`);
  }

  /**
   * 分页查询告警列表
   * GET /api/v1/alarms
   */
  getList(params: AlarmQueryParams): Observable<ApiResponse<PageResult<AlarmItem>>> {
    let httpParams = new HttpParams()
      .set('pageIndex', String(params.pageIndex))
      .set('pageSize', String(params.pageSize));

    if (params.keyword) httpParams = httpParams.set('keyword', params.keyword);
    if (params.type) httpParams = httpParams.set('type', params.type);
    if (params.level) httpParams = httpParams.set('level', params.level);
    if (params.status) httpParams = httpParams.set('status', params.status);

    return this.http.get<ApiResponse<PageResult<AlarmItem>>>(this.baseUrl, {
      params: httpParams
    });
  }

  /**
   * 获取告警详情
   * GET /api/v1/alarms/{alarm_id}
   */
  getDetail(alarmId: number): Observable<ApiResponse<AlarmItem>> {
    return this.http.get<ApiResponse<AlarmItem>>(`${this.baseUrl}/${alarmId}`);
  }

  /**
   * 获取处置记录
   * GET /api/v1/alarms/{alarm_id}/records
   */
  getDisposeRecords(alarmId: number): Observable<ApiResponse<AlarmDisposeRecord[]>> {
    return this.http.get<ApiResponse<AlarmDisposeRecord[]>>(`${this.baseUrl}/${alarmId}/records`);
  }

  /**
   * 处置告警
   * POST /api/v1/alarms/{alarm_id}/dispose
   */
  dispose(alarmId: number, req: DisposeRequest): Observable<ApiResponse<AlarmItem>> {
    return this.http.post<ApiResponse<AlarmItem>>(`${this.baseUrl}/${alarmId}/dispose`, req);
  }

    /** 兼容旧组件调用名 */
  getAlarmList(params: AlarmQueryParams) {
    return this.getList(params);
  }

  disposeAlarm(alarmId: number, req: DisposeRequest) {
    return this.dispose(alarmId, req);
  }


}