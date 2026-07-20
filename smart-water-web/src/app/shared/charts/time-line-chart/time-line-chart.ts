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

    const data = this.chartData();
    const xAxisData = data.map(item => item.time);
    const seriesData = data.map(item => item.value);
    const color = this.lineColor();

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'line' }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: xAxisData,
        axisLine: { lineStyle: { color: '#d9d9d9' } },
        axisLabel: { color: '#666', fontSize: 12 }
      },
      yAxis: {
        type: 'value',
        name: this.yAxisName(),
        nameTextStyle: { color: '#666', fontSize: 12 },
        axisLine: { show: false },
        splitLine: { lineStyle: { color: '#f0f0f0' } },
        axisLabel: { color: '#666', fontSize: 12 }
      },
      series: [
        {
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 4,
          lineStyle: { color, width: 2 },
          itemStyle: { color },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: color + '33' },
              { offset: 1, color: color + '05' }
            ])
          },
          data: seriesData
        }
      ]
    };

    this.chartInstance.setOption(option, true);
  }
}
