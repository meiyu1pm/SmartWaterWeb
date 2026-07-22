import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { TimeLineChart } from '../../shared/charts/time-line-chart/time-line-chart';
import { KpiCardComponent } from '../../shared/components/kpi-card/kpi-card.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { EmptyComponent } from '../../shared/components/empty/empty.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
// 导入服务与类型
import { LeakageService, KpiItem, AreaRiskItem, AnomalyItem, FlowDataItem, FlowSeriesItem } from './leakage.service';

@Component({
  selector: 'app-leakage',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzCardModule,
    NzGridModule,
    NzTableModule,
    NzTagModule,
    NzSelectModule,
    NzDatePickerModule,
    TimeLineChart,
    KpiCardComponent,
    LoadingComponent,
    EmptyComponent,
    ErrorStateComponent
  ],
  templateUrl: './leakage.html',
  styleUrl: './leakage.scss'
})
export class Leakage implements OnInit {
  kpiList: KpiItem[] = [];
  areaRiskData: AreaRiskItem[] = [];
  anomalyTableData: AnomalyItem[] = [];
  flowChartData: FlowDataItem[] = [];
  flowPressureSeries: FlowSeriesItem[] = [];
  nightFlowData: FlowDataItem[] = [];

  // 顶部筛选条件
  areaId = 'all';
  dateRange: Date[] | null = null;

  loading = false;
  errorMsg = '';

  // 注入服务
  constructor(private leakageService: LeakageService) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  /**
   * 运行分析：根据当前筛选条件重新加载数据
   */
  onAnalyze(): void {
    this.loadAllData();
  }

  /**
   * 导出报告（P0阶段先弹提示占位）
   */
  onExportReport(): void {
    // TODO: 后续接入真实导出接口
    alert('报告导出功能开发中');
  }

  /**
   * 分区风险等级转文字
   */
  getRiskLevelText(level: AreaRiskItem['level']): string {
    const map: Record<AreaRiskItem['level'], string> = {
      high: '高风险',
      medium: '中风险',
      low: '低风险'
    };
    return map[level];
  }

  /**
   * 分区风险等级转颜色
   */
  getRiskLevelColor(level: AreaRiskItem['level']): string {
    const map: Record<AreaRiskItem['level'], string> = {
      high: '#f5222d',
      medium: '#faad14',
      low: '#52c41a'
    };
    return map[level];
  }

  loadAllData(): void {
    this.loading = true;
    this.errorMsg = '';

    forkJoin({
      kpi: this.leakageService.getKpiList(this.areaId),
      areaRisk: this.leakageService.getAreaRiskList(),
      flow: this.leakageService.getFlowTrendData(),
      flowPressure: this.leakageService.getFlowPressureTrendData(),
      anomalies: this.leakageService.getAnomalyList(),
      nightFlow: this.leakageService.getNightFlowData()
    }).subscribe({
      next: ({ kpi, areaRisk, flow, flowPressure, anomalies, nightFlow }) => {
        if (kpi.code === 0) this.kpiList = kpi.data;
        if (areaRisk.code === 0) this.areaRiskData = areaRisk.data;
        if (flow.code === 0) this.flowChartData = flow.data;
        if (flowPressure.code === 0) this.flowPressureSeries = flowPressure.data;
        if (anomalies.code === 0) this.anomalyTableData = anomalies.data;
        if (nightFlow.code === 0) this.nightFlowData = nightFlow.data;
        this.loading = false;
      },
      error: () => {
        this.errorMsg = '数据加载失败，请稍后重试';
        this.loading = false;
      }
    });
  }
}
