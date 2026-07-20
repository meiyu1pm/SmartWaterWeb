// 接口请求失败时，显示友好的错误提示 + 重试按钮，用户可以点击重新加载数据。
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { WarningOutline } from '@ant-design/icons-angular/icons';

@Component({
  selector: 'app-error-state',
  standalone: true,
  imports: [CommonModule, NzButtonModule, NzIconModule],
  template: `
    <div class="error-wrapper">
      <span nz-icon nzType="warning" nzTheme="outline" class="error-icon"></span>
      <p class="error-text">{{ message }}</p>
      <button nz-button nzType="primary" (click)="onRetry()" *ngIf="showRetry">
        重新加载
      </button>
    </div>
  `,
  styles: [`
    .error-wrapper {
      width: 100%;
      padding: 40px 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }
    .error-icon {
      font-size: 48px;
      color: #ff4d4f;
    }
    .error-text {
      color: #666;
      margin: 0;
      font-size: 14px;
    }
  `]
})
export class ErrorStateComponent {
  @Input() message = '数据加载失败';
  @Input() showRetry = true;
  @Output() retry = new EventEmitter<void>();

  onRetry(): void {
    this.retry.emit();
  }
}
