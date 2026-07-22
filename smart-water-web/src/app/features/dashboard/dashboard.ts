import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, interval, Subscription } from 'rxjs';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { TimeLineChart } from '../../shared/charts/time-line-chart/time-line-chart';
import { KpiCardComponent } from '../../shared/components/kpi-card/kpi-card.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { EmptyComponent } from '../../shared/components/empty/empty.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
// 导入服务与类型
import { DashboardService, OverviewKpiItem, AlarmItem, TaskItem, RealtimeMonitorData } from './dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzGridModule,
    NzTableModule,
    NzTagModule,
    NzBadgeModule,
    NzProgressModule,
    NzRadioModule,
    TimeLineChart,
    KpiCardComponent,
    LoadingComponent,
    EmptyComponent,
    ErrorStateComponent
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit, OnDestroy {
  overviewKpi: OverviewKpiItem[] = [];
  latestAlarmList: AlarmItem[] = [];
  taskList: TaskItem[] = [];

  // 实时时序监控
  metricType: 'flow' | 'pressure' = 'flow';
  realtimeData: RealtimeMonitorData | null = null;
  private realtimeSub: Subscription | null = null;

  loading = false;
  errorMsg = '';

  // 注入服务
  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  ngOnDestroy(): void {
    this.stopRealtimeRefresh();
  }

  loadAllData(): void {
    this.loading = true;
    this.errorMsg = '';

    forkJoin({
      kpi: this.dashboardService.getOverviewKpi(),
      alarms: this.dashboardService.getLatestAlarms(),
      tasks: this.dashboardService.getTaskList()
    }).subscribe({
      next: ({ kpi, alarms, tasks }) => {
        if (kpi.code === 0) this.overviewKpi = kpi.data;
        if (alarms.code === 0) this.latestAlarmList = alarms.data;
        if (tasks.code === 0) this.taskList = tasks.data;
        this.loading = false;
        this.startRealtimeRefresh();
      },
      error: () => {
        this.errorMsg = '数据加载失败，请稍后重试';
        this.loading = false;
      }
    });
  }

  /**
   * 切换实时指标（流量/压力）
   */
  onMetricChange(type: 'flow' | 'pressure'): void {
    this.metricType = type;
    this.refreshRealtimeData();
  }

  /**
   * 启动定时器模拟 WebSocket 秒级刷新
   */
  private startRealtimeRefresh(): void {
    this.refreshRealtimeData();
    this.realtimeSub = interval(3000).subscribe(() => this.refreshRealtimeData());
  }

  /**
   * 停止实时刷新
   */
  private stopRealtimeRefresh(): void {
    this.realtimeSub?.unsubscribe();
    this.realtimeSub = null;
  }

  /**
   * 刷新实时数据
   */
  private refreshRealtimeData(): void {
    this.dashboardService.getRealtimeMonitorData(this.metricType).subscribe(res => {
      if (res.code === 0) {
        this.realtimeData = res.data;
      }
    });
  }

  /**
   * 任务状态转标签文字
   */
  getTaskStatusText(status: TaskItem['status']): string {
    const map: Record<TaskItem['status'], string> = {
      running: '运行中',
      success: '已完成',
      failed: '失败'
    };
    return map[status];
  }

  /**
   * 任务状态转颜色
   */
  getTaskStatusColor(status: TaskItem['status']): string {
    const map: Record<TaskItem['status'], string> = {
      running: '#1677ff',
      success: '#52c41a',
      failed: '#f5222d'
    };
    return map[status];
  }
}
