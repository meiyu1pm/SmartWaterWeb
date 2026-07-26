import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { WelcomeService, WelcomeData } from './welcome.service';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzButtonModule,
    NzIconModule
  ],
  templateUrl: './welcome.html',
  styleUrl: './welcome.scss'
})
export class Welcome implements OnInit {
  welcomeData?: WelcomeData;

  // 功能入口与业务路由一一对应
  featureList = [
    { title: '综合驾驶舱', icon: 'dashboard', path: '/dashboard' },
    { title: '漏损控制', icon: 'warning', path: '/leakage' },
    { title: '城市内涝', icon: 'environment', path: '/waterlogging' },
    { title: '数据质量中心', icon: 'check', path: '/data-quality' }
  ];

  constructor(private welcomeService: WelcomeService) {}

  ngOnInit(): void {
    this.loadWelcomeData();
  }

  private loadWelcomeData(): void {
    this.welcomeService.getWelcomeInfo().subscribe({
      next: (res) => {
        if (res.code === 0) {
          this.welcomeData = res.data;
        }
      },
      error: (err) => {
        console.error('欢迎页数据加载失败', err);
      }
    });
  }
}