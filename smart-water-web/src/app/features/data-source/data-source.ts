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
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzMessageService } from 'ng-zorro-antd/message';

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
  readonly typeText = DATA_SOURCE_TYPE_TEXT;
  readonly typeOptions = DATA_SOURCE_TYPE_OPTIONS;
  readonly statusText = DATA_SOURCE_STATUS_TEXT;
  readonly statusColor = DATA_SOURCE_STATUS_COLOR;
  readonly statusOptions = DATA_SOURCE_STATUS_OPTIONS;
  readonly protocolOptions = DATA_PROTOCOL_OPTIONS;
  readonly protocolText = DATA_PROTOCOL_TEXT;
  readonly pageSizeOptions = PAGE_SIZE_OPTIONS;

  kpiList: DataSourceKpiItem[] = [];
  tableList: DataSourceItem[] = [];
  total = 0;
  loading = false;
  errorMsg = '';

  queryParams = {
    keyword: '',
    sourceType: '',
    status: '',
    pageIndex: 1,
    pageSize: PAGE_SIZE
  };

  isModalVisible = false;
  isModalLoading = false;
  modalTitle = '新增数据源';
  isEditMode = false;
  form!: FormGroup;

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

  loadKpi(): void {
    this.dataSourceService.getKpi().subscribe(res => {
      if (res.code === 0) {
        this.kpiList = res.data;
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
      error: () => {
        this.loading = false;
        this.errorMsg = '网络异常，请稍后重试';
      }
    });
  }

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

  onPageIndexChange(index: number): void {
    this.queryParams.pageIndex = index;
    this.loadList();
  }

  onPageSizeChange(size: number): void {
    this.queryParams.pageSize = size;
    this.queryParams.pageIndex = 1;
    this.loadList();
  }

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
          this.loadKpi();
          this.loadList();
        }
      },
      error: () => {
        this.isModalLoading = false;
      }
    });
  }

  onDelete(item: DataSourceItem): void {
    this.dataSourceService.delete(item.id).subscribe(res => {
      if (res.code === 0) {
        this.loadKpi();
        this.loadList();
      }
    });
  }

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

  onToggleStatus(item: DataSourceItem, checked: boolean): void {
    const status = checked ? 'online' : 'offline';
    this.dataSourceService.toggleStatus(item.id, status).subscribe(res => {
      if (res.code === 0) {
        this.loadKpi();
        this.loadList();
      }
    });
  }

  hasPort(item: DataSourceItem): boolean {
    return item.port !== null && item.port !== undefined;
  }
}