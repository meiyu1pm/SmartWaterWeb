// src/app/core/layout/main-layout/main-layout.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { AuthService, UserInfo } from '../../auth/auth.service';

interface BreadcrumbItem {
  name: string;
  path: string;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    NzLayoutModule, 
    NzMenuModule,
    NzDropDownModule,
    NzAvatarModule,
    NzIconModule,
    NzBreadCrumbModule
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayout implements OnInit {
  isCollapsed = false;
  userInfo: UserInfo | null = null;
  breadcrumbs: BreadcrumbItem[] = [];

  menuList: { path: string; title: string; icon?: string; disabled?: boolean }[] = [
    { path: '/dashboard', title: '综合驾驶舱', icon: 'dashboard' },
    { path: '/leakage', title: '漏损控制', icon: 'warning' },
    { path: '/waterlogging', title: '城市内涝', icon: 'cloud-rain' },
    { path: '/data-source', title: '数据源管理', icon: 'database' },
    { path: '/data-quality', title: '数据质量中心', icon: 'check-circle' },
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.userInfo = this.authService.getUserInfo();
  }

  ngOnInit(): void {
    // 初始化时生成一次面包屑
    this.generateBreadcrumbs();
    
    // 监听路由变化，更新面包屑
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.generateBreadcrumbs();
    });
  }

  /**
   * 根据当前路由生成面包屑
   */
  private generateBreadcrumbs(): void {
    const currentPath = this.router.url;
    this.breadcrumbs = [
      { name: '首页', path: '/dashboard' }
    ];

    // 匹配当前菜单
    const currentMenu = this.menuList.find(item => currentPath.startsWith(item.path));
    if (currentMenu && currentMenu.path !== '/dashboard') {
      this.breadcrumbs.push({
        name: currentMenu.title,
        path: currentMenu.path
      });
    }
  }

  /**
   * 退出登录
   */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}