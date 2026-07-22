// src/app/core/notification.service.ts
import { Injectable } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';

export type MessageType = 'success' | 'error' | 'warning' | 'info' | 'loading';

@Injectable({ providedIn: 'root' })
export class NotificationService {

  constructor(
    private message: NzMessageService
  ) {}

  /**
   * 轻量级顶部消息提示（操作反馈用）
   */
  success(content: string, duration: number = 3000): void {
    this.message.success(content, { nzDuration: duration });
  }

  error(content: string, duration: number = 3000): void {
    this.message.error(content, { nzDuration: duration });
  }

  warning(content: string, duration: number = 3000): void {
    this.message.warning(content, { nzDuration: duration });
  }

  info(content: string, duration: number = 3000): void {
    this.message.info(content, { nzDuration: duration });
  }

  loading(content: string = '加载中...'): string {
    return this.message.loading(content, { nzDuration: 0 }).messageId;
  }

  /**
   * 关闭加载提示
   */
  removeLoading(messageId: string): void {
    this.message.remove(messageId);
  }

  // 后面用到右上角通知和确认弹窗的时候，我们再补充配置
}