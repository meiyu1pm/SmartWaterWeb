import { Routes } from '@angular/router';
import { MainLayout } from './core/layout/main-layout/main-layout';
import { Dashboard } from './features/dashboard/dashboard';
import { Leakage } from './features/leakage/leakage';
import { DataSource } from './features/data-source/data-source';
import { LoginComponent } from './core/auth/login.component';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  // 登录页，独立全屏，不需要主布局
  {
    path: 'login',
    component: LoginComponent,
    title: '登录'
  },
  // 主布局内的所有页面，都加守卫保护
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard, title: '综合驾驶舱' },
      { path: 'leakage', component: Leakage, title: '漏损控制' },
      { path: 'data-source', component: DataSource, title: '数据源管理' },
    ]
  }
];