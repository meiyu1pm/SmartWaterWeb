import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/models/api-response';
import { environment } from '../../../environments/environment';

/* ============ 数据类型定义 ============ */

/** 数据源KPI指标 */
export interface DataSourceKpiItem {
  title: string;
  value: string;
  unit: string;
  color: string;
}

/** 数据源列表项 —— 对齐后端 data_source 表结构 */
export interface DataSourceItem {
  id: number;
  sourceCode: string;       // 数据源编号（唯一）
  sourceName: string;       // 数据源名称
  sourceType: string;       // file / database / api / websocket / mqtt / mq
  protocol: string;         // mqtt / http / modbus / tcp / jdbc ...
  endpoint: string;         // 连接地址
  port: number | null;      // 端口
  collectInterval: string;  // 采集频率
  status: string;           // online / offline / error
  ownerOrg: string;         // 所属组织
  lastUpdateTime: string;   // 最近更新时间
  remark: string;           // 备注
}

/** 新增/编辑表单数据（不含 status/lastUpdateTime，由后端补全） */
export interface DataSourceFormValue {
  id?: number;
  sourceCode: string;
  sourceName: string;
  sourceType: string;
  protocol: string;
  endpoint: string;
  port: number | null;
  collectInterval: string;
  ownerOrg: string;
  remark: string;
}

/** 查询参数 */
export interface DataSourceQueryParams {
  keyword?: string;
  sourceType?: string;
  status?: string;
  pageIndex: number;
  pageSize: number;
}

/** 分页结果 */
export interface PageResult<T> {
  list: T[];
  total: number;
}

/** 测试连接返回 */
export interface TestConnectionResult {
  success: boolean;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class DataSourceService {
  private baseUrl = `${environment.apiBaseUrl}/data-sources`;

  constructor(private http: HttpClient) {}

  /* ============ 接口方法（全部走后端真实接口） ============ */

  /**
   * 获取数据源KPI概览
   * GET /api/v1/data-sources/kpi
   */
  getKpi(): Observable<ApiResponse<DataSourceKpiItem[]>> {
    return this.http.get<ApiResponse<DataSourceKpiItem[]>>(`${this.baseUrl}/kpi`);
  }

  /**
   * 分页查询数据源列表
   * GET /api/v1/data-sources?keyword=&sourceType=&status=&pageIndex=&pageSize=
   * 支持按关键字、类型、状态筛选，后端分页
   */
  getPageList(params: DataSourceQueryParams): Observable<ApiResponse<PageResult<DataSourceItem>>> {
    let httpParams = new HttpParams()
      .set('pageIndex', String(params.pageIndex))
      .set('pageSize', String(params.pageSize));
    if (params.keyword) {
      httpParams = httpParams.set('keyword', params.keyword);
    }
    if (params.sourceType) {
      httpParams = httpParams.set('sourceType', params.sourceType);
    }
    if (params.status) {
      httpParams = httpParams.set('status', params.status);
    }
    return this.http.get<ApiResponse<PageResult<DataSourceItem>>>(this.baseUrl, {
      params: httpParams
    });
  }

  /**
   * 新增数据源
   * POST /api/v1/data-sources  body: DataSourceFormValue
   * 后端补全 id / status=offline / lastUpdateTime
   */
  create(formValue: DataSourceFormValue): Observable<ApiResponse<DataSourceItem>> {
    return this.http.post<ApiResponse<DataSourceItem>>(this.baseUrl, formValue);
  }

  /**
   * 更新数据源
   * PUT /api/v1/data-sources/{id}  body: DataSourceFormValue
   * 后端保留原 status，更新 lastUpdateTime
   */
  update(formValue: DataSourceFormValue): Observable<ApiResponse<DataSourceItem>> {
    const id = formValue.id!;
    return this.http.put<ApiResponse<DataSourceItem>>(`${this.baseUrl}/${id}`, formValue);
  }

  /**
   * 删除数据源
   * DELETE /api/v1/data-sources/{id}
   */
  delete(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
  }

  /**
   * 测试连接
   * POST /api/v1/data-sources/{id}/test
   */
  testConnection(id: number): Observable<ApiResponse<TestConnectionResult>> {
    return this.http.post<ApiResponse<TestConnectionResult>>(`${this.baseUrl}/${id}/test`, {});
  }

  /**
   * 启停数据源
   * POST /api/v1/data-sources/{id}/toggle?status=online|offline
   */
  toggleStatus(id: number, status: 'online' | 'offline'): Observable<ApiResponse<null>> {
    const params = new HttpParams().set('status', status);
    return this.http.post<ApiResponse<null>>(`${this.baseUrl}/${id}/toggle`, {}, { params });
  }
}
