import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, NzLayoutModule, NzMenuModule],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayout {
  menuList = [
    { path: '/dashboard', title: '综合驾驶舱' },
    { path: '/leakage', title: '漏损控制' },
    { path: '/data-source', title: '数据源管理' },
    { path: '/data-quality', title: '数据质量中心', disabled: true },
  ];
}
