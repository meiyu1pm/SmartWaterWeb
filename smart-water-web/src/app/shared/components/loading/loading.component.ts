//接口请求数据时，页面显示加载动画，避免空白无反馈。
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzSpinModule } from 'ng-zorro-antd/spin';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule, NzSpinModule],
  template: `
    <div class="loading-wrapper">
      <nz-spin nzTip="{{ tip }}"></nz-spin>
    </div>
  `,
  styles: [`
    .loading-wrapper {
      width: 100%;
      padding: 60px 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class LoadingComponent {
  @Input() tip = '加载中...';
}
