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

/** 质量检测结果项 —— 对齐后端 data_quality_result 表结构 */
export interface QualityResultItem {
  id: number;
  pointName: string;       // 点位名称
  pointCode: string;       // 点位编号
  metricCode: string;      // 监测指标 flow/pressure/volume/quality
  qualityType: string;     // 质量类型 missing/duplicate/outlier/freeze/drift/...
  score: number;           // 质量评分 0-100
  level: string;           // 质量等级 excellent/good/warning/poor
  windowStart: string;     // 检测窗口开始
  windowEnd: string;       // 检测窗口结束
  count: number;           // 异常数据条数
  detail: string;          // 详情描述
  detectTime: string;      // 检测时间
}

/** 质量评分趋势 */
export interface QualityScoreTrend {
  date: string;
  score: number;
}

/** 维度统计 */
export interface QualityDimensionStat {
  qualityType: string;
  count: number;
  rate: number;            // 占比 %
  score: number;
}

/** 缺失热力图点位 */
export interface HeatmapPoint {
  pointCode: string;
  pointName: string;
  hours: number[];         // 24个小时的缺失率 0-1
}

/** 查询参数 */
export interface QualityQueryParams {
  keyword?: string;
  qualityType?: string;
  level?: string;
  pageIndex: number;
  pageSize: number;
}

/** 分页结果 */
export interface PageResult<T> {
  list: T[];
  total: number;
}

/** 分析任务返回 */
export interface QualityTaskResult {
  taskId: string;
  status: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class DataQualityService {
  private baseUrl = `${environment.apiBaseUrl}/data-quality`;

  constructor(private http: HttpClient) {}

  /* ============ 接口方法（全部走后端真实接口） ============ */

  /**
   * 获取质量KPI概览
   * GET /api/v1/data-quality/kpi
   */
  getKpi(): Observable<ApiResponse<QualityKpiItem[]>> {
    return this.http.get<ApiResponse<QualityKpiItem[]>>(`${this.baseUrl}/kpi`);
  }

  /**
   * 分页查询质量检测结果
   * GET /api/v1/data-quality/results?keyword=&qualityType=&level=&pageIndex=&pageSize=
   */
  getResults(params: QualityQueryParams): Observable<ApiResponse<PageResult<QualityResultItem>>> {
    let httpParams = new HttpParams()
      .set('pageIndex', String(params.pageIndex))
      .set('pageSize', String(params.pageSize));
    if (params.keyword) {
      httpParams = httpParams.set('keyword', params.keyword);
    }
    if (params.qualityType) {
      httpParams = httpParams.set('qualityType', params.qualityType);
    }
    if (params.level) {
      httpParams = httpParams.set('level', params.level);
    }
    return this.http.get<ApiResponse<PageResult<QualityResultItem>>>(`${this.baseUrl}/results`, {
      params: httpParams
    });
  }

  /**
   * 质量评分趋势（近7天）
   * GET /api/v1/data-quality/score-trend
   */
  getScoreTrend(): Observable<ApiResponse<QualityScoreTrend[]>> {
    return this.http.get<ApiResponse<QualityScoreTrend[]>>(`${this.baseUrl}/score-trend`);
  }

  /**
   * 各维度质量统计
   * GET /api/v1/data-quality/dimension-stats
   */
  getDimensionStats(): Observable<ApiResponse<QualityDimensionStat[]>> {
    return this.http.get<ApiResponse<QualityDimensionStat[]>>(`${this.baseUrl}/dimension-stats`);
  }

  /**
   * 缺失热力图数据（点位×24小时）
   * GET /api/v1/data-quality/heatmap
   */
  getHeatmap(): Observable<ApiResponse<HeatmapPoint[]>> {
    return this.http.get<ApiResponse<HeatmapPoint[]>>(`${this.baseUrl}/heatmap`);
  }

  /**
   * 创建数据质量分析任务
   * POST /api/v1/data-quality/tasks
   */
  createTask(): Observable<ApiResponse<QualityTaskResult>> {
    return this.http.post<ApiResponse<QualityTaskResult>>(`${this.baseUrl}/tasks`, {});
  }
}
