import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzMessageService } from 'ng-zorro-antd/message';
import { KpiCardComponent } from '../../shared/components/kpi-card/kpi-card.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { EmptyComponent } from '../../shared/components/empty/empty.component';
import { AlarmService, AlarmKpi, AlarmItem, DisposeRecord } from './alarm.service';
import {NzDescriptionsModule} from 'ng-zorro-antd/descriptions';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-alarm-dispose',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzGridModule,
    NzTableModule,
    NzTagModule,
    NzButtonModule,
    NzInputModule,
    NzSelectModule,
    NzModalModule,
    NzTimelineModule,
    NzFormModule,
    KpiCardComponent,
    LoadingComponent,
    EmptyComponent,
    NzDescriptionsModule,
  ],
  templateUrl: './alarm-dispose.html',
  styleUrl: './alarm-dispose.scss'
})
export class AlarmDisposeComponent implements OnInit {
  // KPI数据
  kpiList: AlarmKpi[] = [];
  // 告警列表
  alarmList: AlarmItem[] = [];
  total = 0;
  loading = false;

  // 筛选条件
  keyword = '';
  selectedType = '';
  selectedLevel = '';
  selectedStatus = '';
  pageIndex = 1;
  pageSize = 10;

  // 详情弹窗
  detailVisible = false;
  currentAlarm?: AlarmItem;
  disposeRecords: DisposeRecord[] = [];
  disposeLoading = false;

  // 处置表单
  disposeRemark = '';
  disposeAction = '';

  // 选项映射
  typeOptions = [
    { label: '全部类型', value: '' },
    { label: '漏损告警', value: 'leakage' },
    { label: '内涝告警', value: 'waterlogging' },
    { label: '质量告警', value: 'quality' },
    { label: '设备告警', value: 'device' }
  ];

  levelOptions = [
    { label: '全部级别', value: '' },
    { label: '蓝色预警', value: 'blue' },
    { label: '黄色预警', value: 'yellow' },
    { label: '橙色预警', value: 'orange' },
    { label: '红色预警', value: 'red' }
  ];

  statusOptions = [
    { label: '全部状态', value: '' },
    { label: '待处理', value: 'pending' },
    { label: '处理中', value: 'processing' },
    { label: '已处理', value: 'handled' },
    { label: '已关闭', value: 'closed' }
  ];

  constructor(
    private alarmService: AlarmService,
    private modal: NzModalService,
    private message: NzMessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // setTimeout(() => {
    //   this.loadKpi();
    //   this.loadAlarmList();
    // }, 3000);
    this.loadKpi();
    this.loadAlarmList();
  }

  // 加载KPI
  loadKpi(): void {
    console.log('开始加载KPI');
    this.alarmService.getKpi().subscribe({
      next: (res) => {
        console.log('KPI接口回调成功，完整响应：', res);
        if (res.code === 0) {
          this.kpiList = res.data;
          console.log('kpiList赋值完成，当前长度：', this.kpiList.length);
        } else {
          console.log('业务状态码不匹配，res.code =', res.code);
        }
      },
      error: (err) => {
        console.error('KPI接口请求失败：', err);
      }
    });
  }

  // 加载告警列表
  loadAlarmList(): void {
    this.loading = true;
    console.log('开始加载告警列表');
    this.alarmService.getAlarmList({
      keyword: this.keyword,
      type: this.selectedType,
      level: this.selectedLevel,
      status: this.selectedStatus,
      pageIndex: this.pageIndex,
      pageSize: this.pageSize
    }).subscribe({
      next: (res) => {
        console.log('告警列表回调成功，完整响应：', res);
        if (res.code === 0) {
          this.alarmList = res.data.list;
          this.total = res.data.total;
          console.log('列表赋值完成，条数：', this.alarmList.length, '总数：', this.total);
        }
        // 关键：所有数据和状态都更新完，再统一刷新视图
        this.loading = false;
        this.cdr.detectChanges();
        console.log('loading已设为false，视图已刷新');
      },
      error: (err) => {
        console.error('加载告警列表失败：', err);
        this.loading = false;
        this.cdr.detectChanges();
        this.message.error('加载告警列表失败');
      }
    });
  }

  // 搜索
  onSearch(): void {
    this.pageIndex = 1;
    this.loadAlarmList();
  }

  // 重置筛选
  onReset(): void {
    this.keyword = '';
    this.selectedType = '';
    this.selectedLevel = '';
    this.selectedStatus = '';
    this.pageIndex = 1;
    this.loadAlarmList();
  }

  // 查看详情
  showDetail(alarm: AlarmItem): void {
    this.currentAlarm = alarm;
    this.detailVisible = true;
    this.disposeRecords = [];
    this.disposeRemark = '';
    this.disposeAction = '';
    
    // 加载处置记录
    this.alarmService.getDisposeRecords(alarm.id).subscribe(res => {
      if (res.code === 0) {
        this.disposeRecords = res.data;
      }
    });
  }

  // 关闭详情
  closeDetail(): void {
    this.detailVisible = false;
    this.currentAlarm = undefined;
  }

  // 处置告警
  onDispose(action: string): void {
    if (!this.currentAlarm) return;
    this.disposeLoading = true;
    this.alarmService.disposeAlarm(this.currentAlarm.id, {
      action: action as 'confirm' | 'dispatch' | 'process' | 'close',
      remark: this.disposeRemark,
      handler: '当前用户'
    }).subscribe({
      next: res => {
        console.log('收到告警列表响应：', res);
        if (res.code === 0) {
          const data: any = res.data;
          this.alarmList = data.list || [];
          this.total = data.total || 0;
          console.log('告警列表长度：', this.alarmList.length, '总数：', this.total);
        }
        this.loading = false;
        console.log('loading当前值：', this.loading);
      },
      error: () => {
        this.disposeLoading = false;
        this.message.error('处置失败');
      }
    });
  }

  // 级别颜色
  getLevelColor(level: string): string {
    const colorMap: Record<string, string> = {
      blue: 'blue',
      yellow: 'gold',
      orange: 'orange',
      red: 'red'
    };
    return colorMap[level] || 'default';
  }

  // 级别文字
  getLevelText(level: string): string {
    const textMap: Record<string, string> = {
      blue: '蓝色',
      yellow: '黄色',
      orange: '橙色',
      red: '红色'
    };
    return textMap[level] || level;
  }

  // 状态颜色
  getStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      pending: 'red',
      processing: 'gold',
      handled: 'blue',
      closed: 'green'
    };
    return colorMap[status] || 'default';
  }

  // 状态文字
  getStatusText(status: string): string {
    const textMap: Record<string, string> = {
      pending: '待处理',
      processing: '处理中',
      handled: '已处理',
      closed: '已关闭'
    };
    return textMap[status] || status;
  }

  // 类型文字
  getTypeText(type: string): string {
    const textMap: Record<string, string> = {
      leakage: '漏损告警',
      waterlogging: '内涝告警',
      quality: '质量告警',
      device: '设备告警'
    };
    return textMap[type] || type;
  }

  // 处置动作文字
  getActionText(action: string): string {
    const textMap: Record<string, string> = {
      confirm: '确认告警',
      dispatch: '派单处理',
      process: '处理完成',
      close: '关闭告警'
    };
    return textMap[action] || action;
  }

  // 动作颜色
  getActionColor(action: string): string {
    const colorMap: Record<string, string> = {
      confirm: 'primary',
      dispatch: 'warning',
      process: 'default',
      close: 'danger'
    };
    return colorMap[action] || 'default';
  }
}