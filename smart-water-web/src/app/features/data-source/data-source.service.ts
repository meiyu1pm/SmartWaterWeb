import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
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

/** 数据源列表项 */
export interface DataSourceItem {
  id: number;
  sourceCode: string;
  sourceName: string;
  sourceType: string;
  protocol: string;
  endpoint: string;
  port: number | null;
  collectInterval: string;
  status: string;
  ownerOrg: string;
  lastUpdateTime: string;
  remark: string;
}

/** 新增/编辑表单数据 */
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

@Injectable({ providedIn: 'root' })
export class DataSourceService {
  private baseUrl = `${environment.apiBaseUrl}/data-sources`;

  constructor(private http: HttpClient) {}

  /* ============ Mock 数据 ============ */

  private mockList: DataSourceItem[] = [
    { id: 1, sourceCode: 'DS-FT-001', sourceName: '经开6分区流量计', sourceType: 'mqtt', protocol: 'mqtt', endpoint: '192.168.10.21', port: 1883, collectInterval: '15s', status: 'online', ownerOrg: '经开供水所', lastUpdateTime: '2026-07-20 13:10:22', remark: 'DMA分区入口流量' },
    { id: 2, sourceCode: 'DS-PT-002', sourceName: '纬二路压力监测点', sourceType: 'mqtt', protocol: 'mqtt', endpoint: '192.168.10.35', port: 1883, collectInterval: '30s', status: 'online', ownerOrg: '市政管网科', lastUpdateTime: '2026-07-20 13:08:15', remark: '管网末端压力' },
    { id: 3, sourceCode: 'DS-DB-003', sourceName: '远传水表数据库', sourceType: 'database', protocol: 'jdbc', endpoint: '10.0.20.100:5432/water_meter', port: 5432, collectInterval: '1h', status: 'online', ownerOrg: '信息中心', lastUpdateTime: '2026-07-20 12:00:00', remark: 'PostgreSQL 日度抄表' },
    { id: 4, sourceCode: 'DS-FT-004', sourceName: '钻石花园DMA流量计', sourceType: 'mqtt', protocol: 'mqtt', endpoint: '192.168.10.52', port: 1883, collectInterval: '15s', status: 'offline', ownerOrg: '经开供水所', lastUpdateTime: '2026-07-20 09:22:41', remark: '设备离线超过2小时' },
    { id: 5, sourceCode: 'DS-API-005', sourceName: '气象局降雨量API', sourceType: 'api', protocol: 'https', endpoint: 'api.weather.gov.cn/rainfall', port: 443, collectInterval: '10min', status: 'online', ownerOrg: '防汛办', lastUpdateTime: '2026-07-20 13:05:00', remark: '第三方气象数据' },
    { id: 6, sourceCode: 'DS-FT-006', sourceName: '朗诗东山樾流量计', sourceType: 'mqtt', protocol: 'mqtt', endpoint: '192.168.10.68', port: 1883, collectInterval: '15s', status: 'error', ownerOrg: '经开供水所', lastUpdateTime: '2026-07-20 11:45:33', remark: '通信异常，数据断续' },
    { id: 7, sourceCode: 'DS-WS-007', sourceName: '泵站运行状态WebSocket', sourceType: 'websocket', protocol: 'websocket', endpoint: 'ws://10.0.20.55:8080/pump', port: 8080, collectInterval: '实时', status: 'online', ownerOrg: '泵站管理科', lastUpdateTime: '2026-07-20 13:12:01', remark: '泵站实时遥测' },
    { id: 8, sourceCode: 'DS-DB-008', sourceName: '机械表月度抄表Excel', sourceType: 'file', protocol: 'http', endpoint: '/upload/monthly_meter.xlsx', port: null, collectInterval: '月度', status: 'offline', ownerOrg: '营业所', lastUpdateTime: '2026-07-18 08:30:00', remark: '每月5日人工导入' },
    { id: 9, sourceCode: 'DS-PT-009', sourceName: '三级管网9区压力计', sourceType: 'mqtt', protocol: 'tcp', endpoint: '192.168.10.77', port: 502, collectInterval: '30s', status: 'online', ownerOrg: '市政管网科', lastUpdateTime: '2026-07-20 13:11:45', remark: 'Modbus TCP 采集' },
    { id: 10, sourceCode: 'DS-FT-010', sourceName: '总表FT-003流量计', sourceType: 'mqtt', protocol: 'mqtt', endpoint: '192.168.10.10', port: 1883, collectInterval: '15s', status: 'online', ownerOrg: '水厂中控', lastUpdateTime: '2026-07-20 13:12:30', remark: '出厂总管流量' },
    { id: 11, sourceCode: 'DS-MQ-011', sourceName: '水质监测消息队列', sourceType: 'mq', protocol: 'mqtt', endpoint: 'broker.water.local', port: 1883, collectInterval: '1min', status: 'online', ownerOrg: '水质检测中心', lastUpdateTime: '2026-07-20 13:10:55', remark: '浊度/余氯/PH' },
    { id: 12, sourceCode: 'DS-FT-012', sourceName: '纬二路片区流量计B', sourceType: 'mqtt', protocol: 'mqtt', endpoint: '192.168.10.36', port: 1883, collectInterval: '15s', status: 'error', ownerOrg: '市政管网科', lastUpdateTime: '2026-07-20 10:18:22', remark: '传感器故障' },
    { id: 13, sourceCode: 'DS-DB-013', sourceName: '管网拓扑模型库', sourceType: 'database', protocol: 'jdbc', endpoint: '10.0.20.101:5432/gis_network', port: 5432, collectInterval: '日度', status: 'online', ownerOrg: '信息中心', lastUpdateTime: '2026-07-20 06:00:00', remark: 'EPANET 拓扑' },
    { id: 14, sourceCode: 'DS-API-014', sourceName: 'SCADA系统数据接口', sourceType: 'api', protocol: 'http', endpoint: 'scada.water.local/api/v2/realtime', port: 8080, collectInterval: '5s', status: 'online', ownerOrg: '水厂中控', lastUpdateTime: '2026-07-20 13:12:50', remark: 'SCADA 实时数据' },
    { id: 15, sourceCode: 'DS-PT-015', sourceName: '钻石花园DMA压力计', sourceType: 'mqtt', protocol: 'mqtt', endpoint: '192.168.10.53', port: 1883, collectInterval: '30s', status: 'offline', ownerOrg: '经开供水所', lastUpdateTime: '2026-07-19 22:15:00', remark: '计划维护停机' },
  ];

  private nextId = 16;

  /* ============ 接口方法 ============ */

  getKpi(): Observable<ApiResponse<DataSourceKpiItem[]>> {
    const total = this.mockList.length;
    const online = this.mockList.filter(d => d.status === 'online').length;
    const offline = this.mockList.filter(d => d.status === 'offline').length;
    const error = this.mockList.filter(d => d.status === 'error').length;
    return of({
      code: 0,
      message: 'success',
      trace_id: 'mock-ds-kpi-001',
      data: [
        { title: '数据源总数', value: String(total), unit: '个', color: '#1677ff' },
        { title: '在线数据源', value: String(online), unit: '个', color: '#52c41a' },
        { title: '离线数据源', value: String(offline), unit: '个', color: '#faad14' },
        { title: '异常数据源', value: String(error), unit: '个', color: '#f5222d' }
      ]
    }).pipe(delay(300));
  }

  getPageList(params: DataSourceQueryParams): Observable<ApiResponse<PageResult<DataSourceItem>>> {
    let filtered = [...this.mockList];

    if (params.keyword) {
      const kw = params.keyword.toLowerCase();
      filtered = filtered.filter(d =>
        d.sourceCode.toLowerCase().includes(kw) ||
        d.sourceName.toLowerCase().includes(kw)
      );
    }

    if (params.sourceType) {
      filtered = filtered.filter(d => d.sourceType === params.sourceType);
    }

    if (params.status) {
      filtered = filtered.filter(d => d.status === params.status);
    }

    const start = (params.pageIndex - 1) * params.pageSize;
    const end = start + params.pageSize;
    const pageList = filtered.slice(start, end);

    return of({
      code: 0,
      message: 'success',
      trace_id: 'mock-ds-list-' + Date.now(),
      data: { list: pageList, total: filtered.length }
    }).pipe(delay(400));
  }

  create(formValue: DataSourceFormValue): Observable<ApiResponse<DataSourceItem>> {
    const newItem: DataSourceItem = {
      id: this.nextId++,
      ...formValue,
      status: 'offline',
      lastUpdateTime: this.formatNow()
    };
    this.mockList.unshift(newItem);
    return of({
      code: 0,
      message: 'success',
      trace_id: 'mock-ds-create-' + Date.now(),
      data: newItem
    }).pipe(delay(300));
  }

  update(formValue: DataSourceFormValue): Observable<ApiResponse<DataSourceItem>> {
    const idx = this.mockList.findIndex(d => d.id === formValue.id);
    if (idx > -1) {
      this.mockList[idx] = {
        ...this.mockList[idx],
        ...formValue,
        lastUpdateTime: this.formatNow()
      };
    }
    return of({
      code: 0,
      message: 'success',
      trace_id: 'mock-ds-update-' + Date.now(),
      data: this.mockList[idx]
    }).pipe(delay(300));
  }

  delete(id: number): Observable<ApiResponse<null>> {
    const idx = this.mockList.findIndex(d => d.id === id);
    if (idx > -1) {
      this.mockList.splice(idx, 1);
    }
    return of({
      code: 0,
      message: 'success',
      trace_id: 'mock-ds-delete-' + Date.now(),
      data: null
    }).pipe(delay(200));
  }

  testConnection(id: number): Observable<ApiResponse<{ success: boolean; message: string }>> {
    const item = this.mockList.find(d => d.id === id);
    const success = !!item && item.status !== 'error';
    return of({
      code: 0,
      message: 'success',
      trace_id: 'mock-ds-test-' + Date.now(),
      data: {
        success,
        message: success ? '连接成功，响应时间 23ms' : '连接失败：设备无响应'
      }
    }).pipe(delay(800));
  }

  toggleStatus(id: number, status: 'online' | 'offline'): Observable<ApiResponse<null>> {
    const idx = this.mockList.findIndex(d => d.id === id);
    if (idx > -1) {
      this.mockList[idx].status = status;
      this.mockList[idx].lastUpdateTime = this.formatNow();
    }
    return of({
      code: 0,
      message: 'success',
      trace_id: 'mock-ds-toggle-' + Date.now(),
      data: null
    }).pipe(delay(200));
  }

  private formatNow(): string {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }
}