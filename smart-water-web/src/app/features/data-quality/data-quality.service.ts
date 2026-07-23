import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/models/api-response';
import { environment } from '../../../environments/environment';

/* ============ 数据类型定义 ============ */
/** 质量KPI指标 */
export interface QualityKpiItem {
  title: string;
  value: string;
  unit: string;
  color: string;
}

/** 质量检测结果项 */
export interface QualityResultItem {
  id: number;
  pointName: string;
  pointCode: string;
  metricCode: string;
  qualityType: string;
  score: number;
  level: string;
  windowStart: string;
  windowEnd: string;
  count: number;
  detail: string;
  detectTime: string;
}

/** 评分趋势项 */
export interface QualityScoreTrend {
  date: string;
  score: number;
}

/** 维度统计项 */
export interface QualityDimensionStat {
  qualityType: string;
  count: number;
  rate: number;
  score: number;
}

/** 热力图点位 */
export interface HeatmapPoint {
  pointCode: string;
  pointName: string;
  hours: number[];
}

/** 分页结果 */
export interface PageResult<T> {
  list: T[];
  total: number;
}

/** 查询参数 */
export interface QualityQueryParams {
  keyword?: string;
  qualityType?: string;
  level?: string;
  pageIndex: number;
  pageSize: number;
}

@Injectable({ providedIn: 'root' })
export class DataQualityService {
  private baseUrl = `${environment.apiBaseUrl}/data-quality`;

  constructor(private http: HttpClient) {}

  /* ============ 接口方法 ============ */
  /**
   * 获取质量KPI概览
   * GET /api/v1/data-quality/kpi
   */
  getKpi(): Observable<ApiResponse<QualityKpiItem[]>> {
    return this.http.get<ApiResponse<QualityKpiItem[]>>(`${this.baseUrl}/kpi`);
  }

  /**
   * 分页查询质量检测结果
   * GET /api/v1/data-quality/results
   */
  getResultList(params: QualityQueryParams): Observable<ApiResponse<PageResult<QualityResultItem>>> {
    let httpParams = new HttpParams()
      .set('pageIndex', String(params.pageIndex))
      .set('pageSize', String(params.pageSize));

    if (params.keyword) httpParams = httpParams.set('keyword', params.keyword);
    if (params.qualityType) httpParams = httpParams.set('qualityType', params.qualityType);
    if (params.level) httpParams = httpParams.set('level', params.level);

    return this.http.get<ApiResponse<PageResult<QualityResultItem>>>(`${this.baseUrl}/results`, {
      params: httpParams
    });
  }

  /**
   * 获取质量评分趋势
   * GET /api/v1/data-quality/score-trend
   */
  getScoreTrend(): Observable<ApiResponse<QualityScoreTrend[]>> {
    return this.http.get<ApiResponse<QualityScoreTrend[]>>(`${this.baseUrl}/score-trend`);
  }

  /**
   * 获取各质量维度统计
   * GET /api/v1/data-quality/dimension-stats
   */
  getDimensionStats(): Observable<ApiResponse<QualityDimensionStat[]>> {
    return this.http.get<ApiResponse<QualityDimensionStat[]>>(`${this.baseUrl}/dimension-stats`);
  }

  /**
   * 获取24小时质量热力图数据
   * GET /api/v1/data-quality/heatmap
   */
  getHeatmap(): Observable<ApiResponse<HeatmapPoint[]>> {
    return this.http.get<ApiResponse<HeatmapPoint[]>>(`${this.baseUrl}/heatmap`);
  }

  /**
   * 创建质量分析任务
   * POST /api/v1/data-quality/tasks
   */
  createTask(): Observable<ApiResponse<{ taskId: string; status: string; message: string }>> {
    return this.http.post<ApiResponse<{ taskId: string; status: string; message: string }>>(
      `${this.baseUrl}/tasks`,
      {}
    );
  }
}