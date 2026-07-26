import { Routes } from '@angular/router';
import { MainLayout } from './core/layout/main-layout/main-layout';
import { Dashboard } from './features/dashboard/dashboard';
import { Leakage } from './features/leakage/leakage';
import { DataSource } from './features/data-source/data-source';
import { DataQuality } from './features/data-quality/data-quality';
import { LoginComponent } from './core/auth/login.component';
import { authGuard } from './core/auth/auth.guard';
import { Waterlogging } from './features/waterlogging/waterlogging';
import { AlarmDisposeComponent } from './features/alarm-dispose/alarm-dispose';
// 新增导入欢迎页组件
import { Welcome } from  './features/welcome/welcome'


export const routes: Routes = [
  // 根路径默认跳转欢迎页
  { path: '', redirectTo: 'welcome', pathMatch: 'full' },
  // 欢迎页：独立全屏页面
  { path: 'welcome', component: Welcome, title: '智慧水务平台' },
  // 登录页：独立全屏页面
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
      { path: 'waterlogging', component: Waterlogging, title: '城市内涝' },
      { path: 'data-source', component: DataSource, title: '数据源管理' },
      { path: 'data-quality', component: DataQuality, title: '数据质量中心' },
      { path: 'alarm', component: AlarmDisposeComponent, title: '告警处置' }
    ]
  }
];