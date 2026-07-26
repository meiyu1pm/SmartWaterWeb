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
import { PermissionService } from '../../auth/permission.service';

interface BreadcrumbItem {
  name: string;
  path: string;
}

interface MenuItem {
  path: string;
  title: string;
  icon?: string;
  permission?: string;
  disabled?: boolean;
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
  visibleMenuList: MenuItem[] = [];

  private fullMenuList: MenuItem[] = [
    { path: '/dashboard', title: '综合驾驶舱', icon: 'dashboard', permission: 'dataset:read' },
    { path: '/leakage', title: '漏损控制', icon: 'warning', permission: 'result:read' },
    { path: '/waterlogging', title: '城市内涝', icon: 'environment', permission: 'result:read' },
    { path: '/data-source', title: '数据源管理', icon: 'database', permission: 'data_source:read' },
    { path: '/data-quality', title: '数据质量中心', icon: 'check', permission: 'dataset:read' },
    { path: '/alarm', title: '告警处置', icon: 'alert', permission: 'task:read' },
    { path: '/algorithm', title: '算法管理', icon: 'thunderbolt', permission: 'algorithm:read' },
    { path: '/task', title: '任务中心', icon: 'reload', permission: 'task:read' },
    { path: '/system', title: '系统管理', icon: 'setting', permission: 'user:manage' }
  ];

  constructor(
    private authService: AuthService,
    private permissionService: PermissionService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.userInfo = this.authService.getUserInfo();
  }

  ngOnInit(): void {
    this.filterMenuByPermission();
    this.generateBreadcrumbs();
    
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.generateBreadcrumbs();
    });
  }

  /**
   * 根据权限过滤菜单
   */
  private filterMenuByPermission(): void {
    this.visibleMenuList = this.fullMenuList.filter(item => {
      if (!item.permission) return true;
      return this.permissionService.hasPerm(item.permission);
    });
  }

  /**
   * 根据当前路由生成面包屑
   */
  private generateBreadcrumbs(): void {
  const currentPath = this.router.url;
  this.breadcrumbs = [
    { name: '首页', path: '/welcome' }
  ];
  const currentMenu = this.visibleMenuList.find(item => currentPath.startsWith(item.path));
  if (currentMenu) {
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