import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { TimeLineChart } from '../../shared/charts/time-line-chart/time-line-chart';
// 导入服务与类型
import { DashboardService, OverviewKpiItem, FlowDataItem, AlarmItem } from './dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzGridModule,
    NzTableModule,
    NzTagModule,
    NzBadgeModule,
    TimeLineChart
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  overviewKpi: OverviewKpiItem[] = [];
  totalFlowData: FlowDataItem[] = [];
  latestAlarmList: AlarmItem[] = [];

  // 注入服务
  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  private loadAllData(): void {
    // 加载KPI数据
    this.dashboardService.getOverviewKpi().subscribe(res => {
      if (res.code === 0) {
        this.overviewKpi = res.data;
      }
    });

    // 加载流量趋势数据
    this.dashboardService.getTotalFlowData().subscribe(res => {
      if (res.code === 0) {
        this.totalFlowData = res.data;
      }
    });

    // 加载告警列表
    this.dashboardService.getLatestAlarms().subscribe(res => {
      if (res.code === 0) {
        this.latestAlarmList = res.data;
      }
    });
  }
}
