import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { TimeLineChart } from '../../shared/charts/time-line-chart/time-line-chart';
// 导入服务与类型
import { LeakageService, KpiItem, AreaRiskItem, AnomalyItem, FlowDataItem } from './leakage.service';

@Component({
  selector: 'app-leakage',
  standalone: true,
  imports: [
    CommonModule,
    NzButtonModule,
    NzCardModule,
    NzGridModule,
    NzTableModule,
    NzTagModule,
    NzSelectModule,
    NzDatePickerModule,
    TimeLineChart
  ],
  templateUrl: './leakage.html',
  styleUrl: './leakage.scss'
})
export class Leakage implements OnInit {
  kpiList: KpiItem[] = [];
  areaRiskData: AreaRiskItem[] = [];
  anomalyTableData: AnomalyItem[] = [];
  flowChartData: FlowDataItem[] = [];
  nightFlowData: FlowDataItem[] = [];

  // 注入服务
  constructor(private leakageService: LeakageService) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  private loadAllData(): void {
    // 加载KPI指标
    this.leakageService.getKpiList().subscribe(res => {
      if (res.code === 0) {
        this.kpiList = res.data;
      }
    });

    // 加载分区风险
    this.leakageService.getAreaRiskList().subscribe(res => {
      if (res.code === 0) {
        this.areaRiskData = res.data;
      }
    });

    // 加载流量趋势
    this.leakageService.getFlowTrendData().subscribe(res => {
      if (res.code === 0) {
        this.flowChartData = res.data;
      }
    });

    // 加载异常点列表
    this.leakageService.getAnomalyList().subscribe(res => {
      if (res.code === 0) {
        this.anomalyTableData = res.data;
      }
    });

    // 加载夜间最小流量
    this.leakageService.getNightFlowData().subscribe(res => {
      if (res.code === 0) {
        this.nightFlowData = res.data;
      }
    });
  }
}
