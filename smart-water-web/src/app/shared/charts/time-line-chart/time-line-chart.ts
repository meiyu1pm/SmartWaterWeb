import { Component, viewChild, effect, ElementRef, OnDestroy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as echarts from 'echarts';

@Component({
  selector: 'app-time-line-chart',
  standalone: true,
  imports: [CommonModule],
  template: `<div #chartContainer style="width: 100%; height: 300px;"></div>`,
  styles: []
})
export class TimeLineChart implements OnDestroy {
  // Signal 输入属性，替代 @Input 装饰器，天然响应式
  chartData = input<{ time: string; value: number }[]>([]);
  yAxisName = input('');
  lineColor = input('#1677ff');

  // 多指标叠加模式：传入多条线配置
  seriesList = input<{ name: string; data: { time: string; value: number }[]; color?: string; lineType?: 'solid' | 'dashed' }[]>([]);

  // 阈值虚线：upper 上限 / lower 下限
  thresholds = input<{ upper: number; lower: number } | null>(null);

  // 异常点标注
  markPoints = input<{ time: string; value: number }[]>([]);

  // 用 viewChild signal 获取 DOM 引用
  chartContainer = viewChild.required<ElementRef<HTMLDivElement>>('chartContainer');
  private chartInstance: echarts.ECharts | null = null;
  private resizeObserver: ResizeObserver | null = null;

  constructor() {
    // effect 自动追踪所有依赖的 signal：chartData / lineColor / yAxisName / chartContainer
    // 任意一个发生变化，自动执行图表渲染逻辑
    effect(() => {
      const container = this.chartContainer().nativeElement;
      if (!container) return;

      // 实例未初始化则先初始化
      if (!this.chartInstance) {
        this.chartInstance = echarts.init(container);
        this.resizeObserver = new ResizeObserver(() => this.chartInstance?.resize());
        this.resizeObserver.observe(container);
      }

      // 每次依赖变化都更新图表
      this.updateChart();
    });
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.chartInstance?.dispose();
    this.chartInstance = null;
  }

  private updateChart(): void {
    if (!this.chartInstance) return;

    const multiSeries = this.seriesList();
    const isMulti = multiSeries.length > 0;

    // 统一 x 轴：取第一条时间序列的时间点
    const xAxisData = isMulti
      ? (multiSeries[0].data.map(item => item.time) as string[])
      : (this.chartData().map(item => item.time) as string[]);

    const series: echarts.SeriesOption[] = isMulti
      ? multiSeries.map((s, index) => this.buildSeriesItem(s.name, s.data.map(item => item.value), s.color, s.lineType, index === 0, index))
      : [this.buildSeriesItem('', this.chartData().map(item => item.value), this.lineColor(), 'solid', true, 0)];

    // 多指标叠加时启用双 Y 轴，避免数值量级差异导致某条线被压扁
    const yAxis: echarts.EChartsOption['yAxis'] = isMulti
      ? [
          {
            type: 'value',
            name: multiSeries[0]?.name ?? this.yAxisName(),
            nameTextStyle: { color: '#666', fontSize: 12 },
            axisLine: { show: false },
            splitLine: { lineStyle: { color: '#f0f0f0' } },
            axisLabel: { color: '#666', fontSize: 12 }
          },
          {
            type: 'value',
            name: multiSeries[1]?.name ?? '',
            nameTextStyle: { color: '#666', fontSize: 12 },
            axisLine: { show: false },
            splitLine: { show: false },
            axisLabel: { color: '#666', fontSize: 12 }
          }
        ]
      : {
          type: 'value',
          name: this.yAxisName(),
          nameTextStyle: { color: '#666', fontSize: 12 },
          axisLine: { show: false },
          splitLine: { lineStyle: { color: '#f0f0f0' } },
          axisLabel: { color: '#666', fontSize: 12 }
        };

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'line' }
      },
      legend: isMulti
        ? {
            data: multiSeries.map(s => s.name),
            bottom: 0
          }
        : undefined,
      grid: {
        left: '3%',
        right: isMulti ? '8%' : '4%',
        bottom: isMulti ? '10%' : '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: xAxisData,
        axisLine: { lineStyle: { color: '#d9d9d9' } },
        axisLabel: { color: '#666', fontSize: 12 }
      },
      yAxis,
      series
    };

    this.chartInstance.setOption(option, true);
  }

  private buildSeriesItem(
    name: string,
    data: number[],
    color = '#1677ff',
    lineType: 'solid' | 'dashed' = 'solid',
    showArea = false,
    yAxisIndex = 0
  ): echarts.SeriesOption {
    const thresholds = this.thresholds();
    const markPoints = this.markPoints();

    const item: echarts.SeriesOption = {
      name,
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 4,
      lineStyle: { color, width: 2, type: lineType },
      itemStyle: { color },
      data,
      yAxisIndex
    };

    if (showArea) {
      item.areaStyle = {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: color + '33' },
          { offset: 1, color: color + '05' }
        ])
      };
    }

    // 阈值虚线
    if (thresholds) {
      item.markLine = {
        silent: true,
        symbol: 'none',
        data: [
          {
            yAxis: thresholds.upper,
            lineStyle: { color: '#f5222d', type: 'dashed', width: 1 }
          },
          {
            yAxis: thresholds.lower,
            lineStyle: { color: '#f5222d', type: 'dashed', width: 1 }
          }
        ]
      };
    }

    // 异常点标红
    if (markPoints.length > 0) {
      item.markPoint = {
        symbol: 'pin',
        symbolSize: 32,
        itemStyle: { color: '#f5222d' },
        label: { color: '#fff', fontSize: 10 },
        data: markPoints.map(p => ({ name: '异常', coord: [p.time, p.value] }))
      };
    }

    return item;
  }
}
