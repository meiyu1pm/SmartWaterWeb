import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as echarts from 'echarts';

import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';

import {
  DataQualityService,
  QualityKpiItem,
  QualityResultItem,
  QualityScoreTrend,
  QualityDimensionStat,
  HeatmapPoint
} from './data-quality.service';
import {
  QUALITY_TYPE_TEXT,
  QUALITY_TYPE_OPTIONS,
  QUALITY_TYPE_TAG_COLOR,
  QUALITY_LEVEL_TEXT,
  QUALITY_LEVEL_COLOR,
  QUALITY_LEVEL_OPTIONS,
  METRIC_CODE_TEXT,
  PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  getQualityLevel
} from '../../shared/models/constant';

@Component({
  selector: 'app-data-quality',
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
    NzBadgeModule,
    NzIconModule,
    NzEmptyModule,
    NzSpinModule,
    NzTooltipModule,
    NzProgressModule,
    NzModalModule,
    NzDescriptionsModule
  ],
  templateUrl: './data-quality.html',
  styleUrl: './data-quality.scss'
})
export class DataQuality implements OnInit, AfterViewInit, OnDestroy {
  /* 常量暴露给模板 */
  readonly typeText = QUALITY_TYPE_TEXT;
  readonly typeOptions = QUALITY_TYPE_OPTIONS;
  readonly typeTagColor = QUALITY_TYPE_TAG_COLOR;
  readonly levelText = QUALITY_LEVEL_TEXT;
  readonly levelColor = QUALITY_LEVEL_COLOR;
  readonly levelOptions = QUALITY_LEVEL_OPTIONS;
  readonly metricText = METRIC_CODE_TEXT;
  readonly pageSizeOptions = PAGE_SIZE_OPTIONS;

  /* KPI 数据 */
  kpiList: QualityKpiItem[] = [];

  /* 图表数据 */
  scoreTrend: QualityScoreTrend[] = [];
  dimensionStats: QualityDimensionStat[] = [];
  heatmapData: HeatmapPoint[] = [];

  /* 表格数据 */
  tableList: QualityResultItem[] = [];
  total = 0;
  loading = false;
  errorMsg = '';

  /* 查询参数 */
  queryParams = {
    keyword: '',
    qualityType: '',
    level: '',
    pageIndex: 1,
    pageSize: PAGE_SIZE
  };

  /* 详情弹窗 */
  detailVisible = false;
  detailItem: QualityResultItem | null = null;

  /* 运行分析 */
  isAnalyzing = false;

  /* 图表实例 */
  @ViewChild('trendChart') trendChartRef!: ElementRef<HTMLDivElement>;
  @ViewChild('dimensionChart') dimensionChartRef!: ElementRef<HTMLDivElement>;
  @ViewChild('heatmapChart') heatmapChartRef!: ElementRef<HTMLDivElement>;
  private trendChart: echarts.ECharts | null = null;
  private dimensionChart: echarts.ECharts | null = null;
  private heatmapChart: echarts.ECharts | null = null;
  private resizeObserver: ResizeObserver | null = null;

  constructor(
    private qualityService: DataQualityService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.loadKpi();
    this.loadScoreTrend();
    this.loadDimensionStats();
    this.loadHeatmap();
    this.loadResults();
  }

  ngAfterViewInit(): void {
    this.resizeObserver = new ResizeObserver(() => {
      this.trendChart?.resize();
      this.dimensionChart?.resize();
      this.heatmapChart?.resize();
    });
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.trendChart?.dispose();
    this.dimensionChart?.dispose();
    this.heatmapChart?.dispose();
  }

  /* ============ 数据加载 ============ */
  loadKpi(): void {
    this.qualityService.getKpi().subscribe({
      next: res => {
        if (res.code === 0) {
          this.kpiList = res.data;
        }
      },
      error: err => console.error('KPI加载失败', err)
    });
  }

  loadResults(): void {
    this.loading = true;
    this.errorMsg = '';

    this.qualityService.getResults(this.queryParams).subscribe({
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
        console.error('质量结果加载失败', err);
      }
    });
  }

  loadScoreTrend(): void {
    this.qualityService.getScoreTrend().subscribe({
      next: res => {
        if (res.code === 0) {
          this.scoreTrend = res.data;
          this.renderTrendChart();
        }
      },
      error: err => console.error('评分趋势加载失败', err)
    });
  }

  loadDimensionStats(): void {
    this.qualityService.getDimensionStats().subscribe({
      next: res => {
        if (res.code === 0) {
          this.dimensionStats = res.data;
          this.renderDimensionChart();
        }
      },
      error: err => console.error('维度统计加载失败', err)
    });
  }

  loadHeatmap(): void {
    this.qualityService.getHeatmap().subscribe({
      next: res => {
        if (res.code === 0) {
          this.heatmapData = res.data;
          this.renderHeatmap();
        }
      },
      error: err => console.error('热力图加载失败', err)
    });
  }

  /* ============ 查询/重置 ============ */
  onSearch(): void {
    this.queryParams.pageIndex = 1;
    this.loadResults();
  }

  onReset(): void {
    this.queryParams.keyword = '';
    this.queryParams.qualityType = '';
    this.queryParams.level = '';
    this.queryParams.pageIndex = 1;
    this.loadResults();
  }

  /* ============ 分页 ============ */
  onPageIndexChange(index: number): void {
    this.queryParams.pageIndex = index;
    this.loadResults();
  }

  onPageSizeChange(size: number): void {
    this.queryParams.pageSize = size;
    this.queryParams.pageIndex = 1;
    this.loadResults();
  }

  /* ============ 详情弹窗 ============ */
  showDetail(item: QualityResultItem): void {
    this.detailItem = item;
    this.detailVisible = true;
  }

  closeDetail(): void {
    this.detailVisible = false;
  }

  /* ============ 运行分析 ============ */
  onRunAnalysis(): void {
    this.isAnalyzing = true;
    this.qualityService.createTask().subscribe({
      next: res => {
        this.isAnalyzing = false;
        if (res.code === 0) {
          this.message.success(res.data.message || '分析任务已创建');
          // 延迟刷新数据，模拟分析完成
          setTimeout(() => {
            this.loadKpi();
            this.loadResults();
            this.loadScoreTrend();
            this.loadDimensionStats();
            this.loadHeatmap();
            this.message.success('数据分析已完成，结果已更新');
          }, 2000);
        }
      },
      error: err => {
        this.isAnalyzing = false;
        this.message.error('创建分析任务失败');
        console.error('分析任务创建失败', err);
      }
    });
  }

  /* ============ 图表渲染 ============ */

  /** 质量评分趋势折线图 */
  private renderTrendChart(): void {
    if (!this.trendChartRef) return;
    if (!this.trendChart) {
      this.trendChart = echarts.init(this.trendChartRef.nativeElement);
      this.resizeObserver?.observe(this.trendChartRef.nativeElement);
    }

    const option: echarts.EChartsOption = {
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: this.scoreTrend.map(d => d.date),
        axisLine: { lineStyle: { color: '#d9d9d9' } },
        axisLabel: { color: '#666', fontSize: 12 }
      },
      yAxis: {
        type: 'value',
        min: 60,
        max: 100,
        name: '评分',
        nameTextStyle: { color: '#666', fontSize: 12 },
        axisLine: { show: false },
        splitLine: { lineStyle: { color: '#f0f0f0' } },
        axisLabel: { color: '#666', fontSize: 12 }
      },
      series: [{
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: '#1677ff', width: 2 },
        itemStyle: { color: '#1677ff' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(22,119,255,0.25)' },
            { offset: 1, color: 'rgba(22,119,255,0.02)' }
          ])
        },
        markLine: {
          silent: true,
          data: [
            { yAxis: 80, lineStyle: { color: '#52c41a', type: 'dashed' }, label: { formatter: '良好线', color: '#52c41a' } },
            { yAxis: 60, lineStyle: { color: '#faad14', type: 'dashed' }, label: { formatter: '预警线', color: '#faad14' } }
          ]
        },
        data: this.scoreTrend.map(d => d.score)
      }]
    };
    this.trendChart.setOption(option, true);
  }

  /** 维度统计柱状图 */
  private renderDimensionChart(): void {
    if (!this.dimensionChartRef) return;
    if (!this.dimensionChart) {
      this.dimensionChart = echarts.init(this.dimensionChartRef.nativeElement);
      this.resizeObserver?.observe(this.dimensionChartRef.nativeElement);
    }

    const typeColors: Record<string, string> = {
      missing: '#fa8c16', duplicate: '#1677ff', outlier: '#f5222d',
      freeze: '#722ed1', drift: '#13c2c2', negative_flow: '#f5222d',
      pressure_oor: '#eb2f96', jump: '#faad14'
    };

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const p = Array.isArray(params) ? params[0] : params;
          const stat = this.dimensionStats[p.dataIndex];
          return `${this.typeText[stat.qualityType] || stat.qualityType}<br/>异常数: ${stat.count} 条<br/>占比: ${stat.rate}%<br/>评分: ${stat.score} 分`;
        }
      },
      grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
      xAxis: {
        type: 'category',
        data: this.dimensionStats.map(d => this.typeText[d.qualityType] || d.qualityType),
        axisLine: { lineStyle: { color: '#d9d9d9' } },
        axisLabel: { color: '#666', fontSize: 11, rotate: 30 },
        axisTick: { alignWithLabel: true }
      },
      yAxis: {
        type: 'value',
        name: '异常条数',
        nameTextStyle: { color: '#666', fontSize: 12 },
        axisLine: { show: false },
        splitLine: { lineStyle: { color: '#f0f0f0' } },
        axisLabel: { color: '#666', fontSize: 12 }
      },
      series: [{
        type: 'bar',
        barWidth: '50%',
        itemStyle: {
          color: (params: any) => {
            const stat = this.dimensionStats[params.dataIndex];
            return typeColors[stat.qualityType] || '#1677ff';
          },
          borderRadius: [4, 4, 0, 0]
        },
        data: this.dimensionStats.map(d => d.count)
      }]
    };
    this.dimensionChart.setOption(option, true);
  }

  /** 缺失热力图 */
  private renderHeatmap(): void {
    if (!this.heatmapChartRef) return;
    if (!this.heatmapChart) {
      this.heatmapChart = echarts.init(this.heatmapChartRef.nativeElement);
      this.resizeObserver?.observe(this.heatmapChartRef.nativeElement);
    }

    const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    const points = this.heatmapData.map(p => p.pointName);
    const data: [number, number, number][] = [];
    let maxVal = 0;
    this.heatmapData.forEach((p, pi) => {
      p.hours.forEach((rate, hi) => {
        data.push([hi, pi, Math.round(rate * 100)]);
        if (rate * 100 > maxVal) maxVal = rate * 100;
      });
    });

    const option: echarts.EChartsOption = {
      tooltip: {
        position: 'top',
        formatter: (params: any) => `${points[params.value[1]]}<br/>${hours[params.value[0]]}<br/>缺失率: ${params.value[2]}%`
      },
      grid: { left: '15%', right: '4%', bottom: '8%', top: '5%', containLabel: true },
      xAxis: {
        type: 'category',
        data: hours,
        splitArea: { show: true },
        axisLabel: { color: '#666', fontSize: 11 },
        axisLine: { lineStyle: { color: '#d9d9d9' } }
      },
      yAxis: {
        type: 'category',
        data: points,
        splitArea: { show: true },
        axisLabel: { color: '#666', fontSize: 11 },
        axisLine: { lineStyle: { color: '#d9d9d9' } }
      },
      visualMap: {
        min: 0,
        max: Math.ceil(maxVal / 10) * 10 || 50,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '0%',
        inRange: { color: ['#52c41a', '#faad14', '#f5222d'] },
        text: ['高缺失', '低缺失'],
        textStyle: { color: '#666', fontSize: 12 }
      },
      series: [{
        name: '缺失率',
        type: 'heatmap',
        data: data,
        label: { show: false },
        emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.3)' } }
      }]
    };
    this.heatmapChart.setOption(option, true);
  }

  /* ============ 辅助方法 ============ */

  /** 获取等级标签颜色 */
  getLevelColor(level: string): string {
    return this.levelColor[level] || '#d9d9d9';
  }

  /** 获取质量类型标签颜色 */
  getTypeTagColor(type: string): string {
    return this.typeTagColor[type] || 'default';
  }
}
