// 通用 KPI 指标卡片
// 文档要求：标题 16px、指标数字 24px 加粗、单位小字、趋势可缺省
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="kpi-card">
      <div class="kpi-header">
        <span class="kpi-title">{{ title }}</span>
        <span *ngIf="trend" class="kpi-trend" [style.color]="trendColor">
          {{ trend }}
        </span>
      </div>
      <div class="kpi-value" [style.color]="color">
        {{ value }}
        <span class="kpi-unit">{{ unit }}</span>
      </div>
    </div>
  `,
  styles: [`
    .kpi-card {
      width: 100%;
    }
    .kpi-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .kpi-title {
      font-size: 14px;
      color: #666;
    }
    .kpi-trend {
      font-size: 12px;
      font-weight: 500;
    }
    .kpi-value {
      font-size: 24px;
      font-weight: 600;
      line-height: 1.2;
    }
    .kpi-unit {
      font-size: 14px;
      font-weight: 400;
      margin-left: 4px;
      color: #999;
    }
  `]
})
export class KpiCardComponent {
  @Input() title = '';
  @Input() value: string | number = '';
  @Input() unit = '';
  @Input() color = '#1677ff';
  @Input() trend = '';

  get trendColor(): string {
    if (!this.trend) return '#999';
    return this.trend.startsWith('+') ? '#f5222d' : '#52c41a';
  }
}
