//列表、表格没有数据时，显示友好的空状态提示，而不是空白页面。
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzEmptyModule } from 'ng-zorro-antd/empty';

@Component({
  selector: 'app-empty',
  standalone: true,
  imports: [CommonModule, NzEmptyModule],
  template: `
    <div class="empty-wrapper">
      <nz-empty nzNotFoundImage="simple">
        <p class="empty-text">{{ description }}</p>
      </nz-empty>
    </div>
  `,
  styles: [`
    .empty-wrapper {
      width: 100%;
      padding: 40px 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .empty-text {
      color: #999;
      margin: 0;
      font-size: 14px;
    }
  `]
})
export class EmptyComponent {
  @Input() description = '暂无数据';
}

