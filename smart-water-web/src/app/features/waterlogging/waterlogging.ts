// src/app/features/waterlogging/waterlogging.ts
import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as echarts from 'echarts';

import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzDividerModule } from 'ng-zorro-antd/divider';

import {
  WaterloggingService,
  WaterloggingKpi,
  PondingPoint,
  RiverFlowData,
  PumpStatus,
  WaterloggingAlarm,
  DispatchPlan
} from './waterlogging.service';
import { NotificationService } from '../../core/notification.service';

// 风险等级颜色映射
const RISK_COLOR = {
  safe: '#52c41a',
  warning: '#faad14',
  danger: '#f5222d'
};

const RISK_TEXT = {
  safe: '安全',
  warning: '预警',
  danger: '危险'
};

const ALARM_COLOR = {
  blue: '#1890ff',
  yellow: '#faad14',
  orange: '#fa8c16',
  red: '#f5222d'
};

const ALARM_TEXT = {
  blue: '蓝色预警',
  yellow: '黄色预警',
  orange: '橙色预警',
  red: '红色预警'
};

const PUMP_STATUS_COLOR = {
  running: '#52c41a',
  stopped: '#8c8c8c',
  fault: '#f5222d'
};

const PUMP_STATUS_TEXT = {
  running: '运行中',
  stopped: '已停止',
  fault: '故障'
};

@Component({
  selector: 'app-waterlogging',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzGridModule,
    NzTableModule,
    NzTagModule,
    NzButtonModule,
    NzSelectModule,
    NzDatePickerModule,
    NzIconModule,
    NzBadgeModule,
    NzEmptyModule,
    NzSpinModule,
    NzAlertModule,
    NzListModule,
    NzDividerModule
  ],
  templateUrl: './waterlogging.html',
  styleUrl: './waterlogging.scss'
})
export class Waterlogging implements OnInit, AfterViewInit, OnDestroy {
  // 暴露给模板的常量
  readonly riskColor = RISK_COLOR;
  readonly riskText = RISK_TEXT;
  readonly alarmColor = ALARM_COLOR;
  readonly alarmText = ALARM_TEXT;
  readonly pumpStatusColor = PUMP_STATUS_COLOR;
  readonly pumpStatusText = PUMP_STATUS_TEXT;

  // 图表实例
  @ViewChild('rainChart') rainChartEl!: ElementRef;
  private rainChart: echarts.ECharts | null = null;
  private resizeObserver: ResizeObserver | null = null;

  // 筛选条件
  selectedArea = 'all';
  selectedTime: Date[] = [];

  // 页面数据
  loading = false;
  kpiList: WaterloggingKpi[] = [];
  pondingList: PondingPoint[] = [];
  rainTrendData: RiverFlowData[] = [];
  pumpList: PumpStatus[] = [];
  alarmList: WaterloggingAlarm[] = [];
  dispatchPlans: DispatchPlan[] = [];

  constructor(
    private waterloggingService: WaterloggingService,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.initChart();
    // 监听窗口大小变化，自适应图表
    this.resizeObserver = new ResizeObserver(() => {
      this.rainChart?.resize();
    });
    this.resizeObserver.observe(this.rainChartEl.nativeElement);
  }

  ngOnDestroy(): void {
    this.rainChart?.dispose();
    this.resizeObserver?.disconnect();
  }

  /**
   * 加载所有页面数据
   */
  loadData(): void {
    this.loading = true;
    const loadingId = this.notify.loading('加载数据中...');

    // 并行加载所有接口
    Promise.all([
      this.waterloggingService.getKpiList(this.selectedArea).toPromise(),
      this.waterloggingService.getPondingPoints().toPromise(),
      this.waterloggingService.getRainTrendData().toPromise(),
      this.waterloggingService.getPumpStatusList().toPromise(),
      this.waterloggingService.getAlarmList().toPromise(),
      this.waterloggingService.getDispatchPlans().toPromise()
    ]).then(([kpiRes, pondingRes, rainRes, pumpRes, alarmRes, planRes]) => {
      this.kpiList = kpiRes?.data || [];
      this.pondingList = pondingRes?.data || [];
      this.rainTrendData = rainRes?.data || [];
      this.pumpList = pumpRes?.data || [];
      this.alarmList = alarmRes?.data || [];
      this.dispatchPlans = planRes?.data || [];

      // 更新图表
      this.updateRainChart();
      this.notify.removeLoading(loadingId);
      this.loading = false;
    }).catch(err => {
      this.notify.removeLoading(loadingId);
      this.loading = false;
      this.notify.error('数据加载失败：' + err?.message);
    });
  }

  /**
   * 初始化降雨-水位-流量图表
   */
  private initChart(): void {
    this.rainChart = echarts.init(this.rainChartEl.nativeElement);
    this.updateRainChart();
  }

  /**
   * 更新图表数据
   */
  private updateRainChart(): void {
    if (!this.rainChart || this.rainTrendData.length === 0) return;

    const times = this.rainTrendData.map(item => item.time);
    const rainfallData = this.rainTrendData.map(item => item.rainfall);
    const waterLevelData = this.rainTrendData.map(item => item.waterLevel);
    const flowData = this.rainTrendData.map(item => item.flow);

    this.rainChart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' }
      },
      legend: {
        data: ['降雨量(mm)', '水位(m)', '流量(m³/s)'],
        top: 0
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '40px',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: times,
        boundaryGap: false
      },
      yAxis: [
        {
          type: 'value',
          name: '降雨量/水位',
          position: 'left',
          axisLine: { lineStyle: { color: '#1890ff' } },
          axisLabel: { formatter: '{value}' }
        },
        {
          type: 'value',
          name: '流量',
          position: 'right',
          axisLine: { lineStyle: { color: '#52c41a' } },
          axisLabel: { formatter: '{value}' }
        }
      ],
      series: [
        {
          name: '降雨量(mm)',
          type: 'bar',
          data: rainfallData,
          itemStyle: { color: '#1890ff' },
          yAxisIndex: 0
        },
        {
          name: '水位(m)',
          type: 'line',
          data: waterLevelData,
          smooth: true,
          itemStyle: { color: '#faad14' },
          lineStyle: { width: 2 },
          yAxisIndex: 0
        },
        {
          name: '流量(m³/s)',
          type: 'line',
          data: flowData,
          smooth: true,
          itemStyle: { color: '#52c41a' },
          lineStyle: { width: 2 },
          yAxisIndex: 1
        }
      ]
    });
  }

  /**
   * 查询按钮
   */
  onSearch(): void {
    this.loadData();
  }

  /**
   * 重置筛选
   */
  onReset(): void {
    this.selectedArea = 'all';
    this.selectedTime = [];
    this.loadData();
  }

  /**
   * 刷新数据
   */
  onRefresh(): void {
    this.loadData();
  }
}