import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSpinModule } from 'ng-zorro-antd/spin';

import { DataSourceService, DataSourceKpiItem, DataSourceItem, DataSourceFormValue } from './data-source.service';
import {
  DATA_SOURCE_TYPE_TEXT,
  DATA_SOURCE_TYPE_OPTIONS,
  DATA_SOURCE_STATUS_TEXT,
  DATA_SOURCE_STATUS_COLOR,
  DATA_SOURCE_STATUS_OPTIONS,
  DATA_PROTOCOL_OPTIONS,
  DATA_PROTOCOL_TEXT,
  PAGE_SIZE,
  PAGE_SIZE_OPTIONS
} from '../../shared/models/constant';

@Component({
  selector: 'app-data-source',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzCardModule,
    NzGridModule,
    NzTableModule,
    NzTagModule,
    NzButtonModule,
    NzInputModule,
    NzSelectModule,
    NzModalModule,
    NzFormModule,
    NzPopconfirmModule,
    NzSwitchModule,
    NzTooltipModule,
    NzBadgeModule,
    NzIconModule,
    NzEmptyModule,
    NzSpinModule
  ],
  templateUrl: './data-source.html',
  styleUrl: './data-source.scss'
})
export class DataSource implements OnInit {
  /* 常量暴露给模板 */
  readonly typeText = DATA_SOURCE_TYPE_TEXT;
  readonly typeOptions = DATA_SOURCE_TYPE_OPTIONS;
  readonly statusText = DATA_SOURCE_STATUS_TEXT;
  readonly statusColor = DATA_SOURCE_STATUS_COLOR;
  readonly statusOptions = DATA_SOURCE_STATUS_OPTIONS;
  readonly protocolOptions = DATA_PROTOCOL_OPTIONS;
  readonly protocolText = DATA_PROTOCOL_TEXT;
  readonly pageSizeOptions = PAGE_SIZE_OPTIONS;

  /* KPI 数据 */
  kpiList: DataSourceKpiItem[] = [];

  /* 表格数据 */
  tableList: DataSourceItem[] = [];
  total = 0;
  loading = false;
  errorMsg = '';

  /* 查询参数 */
  queryParams = {
    keyword: '',
    sourceType: '',
    status: '',
    pageIndex: 1,
    pageSize: PAGE_SIZE
  };

  /* 弹窗 & 表单 */
  isModalVisible = false;
  isModalLoading = false;
  modalTitle = '新增数据源';
  isEditMode = false;
  form!: FormGroup;

  /* 测试连接状态 */
  testingId: number | null = null;

  constructor(
    private dataSourceService: DataSourceService,
    private fb: FormBuilder,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadKpi();
    this.loadList();
  }

  /* ============ 表单初始化 ============ */
  private initForm(): void {
    this.form = this.fb.group({
      id: [null],
      sourceCode: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9_-]+$/)]],
      sourceName: ['', [Validators.required, Validators.maxLength(50)]],
      sourceType: ['mqtt', [Validators.required]],
      protocol: ['mqtt', [Validators.required]],
      endpoint: ['', [Validators.required, Validators.maxLength(200)]],
      port: [null, [Validators.min(1), Validators.max(65535)]],
      collectInterval: ['15s', [Validators.required]],
      ownerOrg: ['', [Validators.required]],
      remark: ['', [Validators.maxLength(200)]]
    });
  }

  /* ============ 数据加载 ============ */
  loadKpi(): void {
    this.dataSourceService.getKpi().subscribe({
      next: res => {
        if (res.code === 0) {
          this.kpiList = res.data;
        }
      },
      error: err => {
        console.error('KPI加载失败', err);
      }
    });
  }

  loadList(): void {
    this.loading = true;
    this.errorMsg = '';

    this.dataSourceService.getPageList(this.queryParams).subscribe({
      next: res => {
        this.loading = false;
        if (res.code === 0) {
          this.tableList = res.data.list;
          this.total = res.data.total;
        } else {
          this.errorMsg = res.message || '查询失败';
        }
      },
      error: err => {
        this.loading = false;
        this.errorMsg = '网络异常，请检查后端服务是否启动';
        console.error('数据源列表加载失败', err);
      }
    });
  }

  /* ============ 查询/重置 ============ */
  onSearch(): void {
    this.queryParams.pageIndex = 1;
    this.loadList();
  }

  onReset(): void {
    this.queryParams.keyword = '';
    this.queryParams.sourceType = '';
    this.queryParams.status = '';
    this.queryParams.pageIndex = 1;
    this.loadList();
  }

  /* ============ 分页 ============ */
  onPageIndexChange(index: number): void {
    this.queryParams.pageIndex = index;
    this.loadList();
  }

  onPageSizeChange(size: number): void {
    this.queryParams.pageSize = size;
    this.queryParams.pageIndex = 1;
    this.loadList();
  }

  /* ============ 新增/编辑 ============ */
  openCreateModal(): void {
    this.isEditMode = false;
    this.modalTitle = '新增数据源';
    this.form.reset({
      sourceType: 'mqtt',
      protocol: 'mqtt',
      collectInterval: '15s'
    });
    this.isModalVisible = true;
  }

  openEditModal(item: DataSourceItem): void {
    this.isEditMode = true;
    this.modalTitle = '编辑数据源';
    this.form.patchValue({
      id: item.id,
      sourceCode: item.sourceCode,
      sourceName: item.sourceName,
      sourceType: item.sourceType,
      protocol: item.protocol,
      endpoint: item.endpoint,
      port: item.port,
      collectInterval: item.collectInterval,
      ownerOrg: item.ownerOrg,
      remark: item.remark
    });
    this.isModalVisible = true;
  }

  handleCancel(): void {
    this.isModalVisible = false;
    this.form.reset();
  }

  handleOk(): void {
    // 校验所有字段
    Object.values(this.form.controls).forEach(ctrl => {
      if (ctrl.invalid) {
        ctrl.markAsDirty();
        ctrl.updateValueAndValidity({ onlySelf: true });
      }
    });

    if (this.form.invalid) {
      return;
    }

    this.isModalLoading = true;
    const formValue: DataSourceFormValue = this.form.value;

    const api$ = this.isEditMode
      ? this.dataSourceService.update(formValue)
      : this.dataSourceService.create(formValue);

    api$.subscribe({
      next: res => {
        this.isModalLoading = false;
        if (res.code === 0) {
          this.isModalVisible = false;
          this.message.success(this.isEditMode ? '编辑成功' : '新增成功');
          this.loadKpi();
          this.loadList();
        } else {
          this.message.error(res.message || '保存失败');
        }
      },
      error: err => {
        this.isModalLoading = false;
        this.message.error('网络异常，保存失败');
        console.error('保存失败', err);
      }
    });
  }

  /* ============ 删除 ============ */
  onDelete(item: DataSourceItem): void {
    this.dataSourceService.delete(item.id).subscribe({
      next: res => {
        if (res.code === 0) {
          this.message.success('删除成功');
          this.loadKpi();
          this.loadList();
        }
      },
      error: err => {
        this.message.error('删除失败');
        console.error('删除失败', err);
      }
    });
  }

  /* ============ 测试连接 ============ */
  onTestConnection(item: DataSourceItem): void {
    this.testingId = item.id;
    this.dataSourceService.testConnection(item.id).subscribe({
      next: res => {
        this.testingId = null;
        if (res.code === 0) {
          if (res.data.success) {
            this.message.success(res.data.message);
          } else {
            this.message.error(res.data.message);
          }
        }
      },
      error: () => {
        this.testingId = null;
      }
    });
  }

  /* ============ 启停 ============ */
  onToggleStatus(item: DataSourceItem, checked: boolean): void {
    const status = checked ? 'online' : 'offline';
    this.dataSourceService.toggleStatus(item.id, status).subscribe({
      next: res => {
        if (res.code === 0) {
          this.message.success(`已${checked ? '启用' : '停用'}：${item.sourceName}`);
          this.loadKpi();
          this.loadList();
        }
      },
      error: err => {
        // 失败时回滚开关状态
        item.status = checked ? 'offline' : 'online';
        this.message.error('操作失败，请重试');
        console.error('启停失败', err);
      }
    });
  }

  /* ============ 辅助方法 ============ */

  /** 获取状态标签颜色 */
  getStatusTagColor(status: string): string {
    return this.statusColor[status] || '#d9d9d9';
  }

  /** 判断端口是否需要显示 */
  hasPort(item: DataSourceItem): boolean {
    return item.port !== null && item.port !== undefined;
  }
}
