import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { zh_CN, provideNzI18n } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import zh from '@angular/common/locales/zh';
import { FormsModule } from '@angular/forms';

import {
  MenuFoldOutline,
  MenuUnfoldOutline,
  UserOutline,
  SettingOutline,
  LogoutOutline,
  DashboardOutline,
  DatabaseOutline,
  AlertOutline,
  EnvironmentOutline,
  SearchOutline,
  PlusOutline,
  EditOutline,
  DeleteOutline,
  ReloadOutline,
  WarningOutline,
  CheckOutline,
  DownOutline
} from '@ant-design/icons-angular/icons';

import { routes } from './app.routes';
import { authInterceptor } from './core/auth/auth.interceptor';
import { errorInterceptor } from './core/error.interceptor';

registerLocaleData(zh);

const icons = [
  MenuFoldOutline,
  MenuUnfoldOutline,
  UserOutline,
  SettingOutline,
  LogoutOutline,
  DashboardOutline,
  DatabaseOutline,
  AlertOutline,
  EnvironmentOutline,
  SearchOutline,
  PlusOutline,
  EditOutline,
  DeleteOutline,
  ReloadOutline,
  WarningOutline,
  CheckOutline,
  DownOutline
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideNzIcons(icons), // 只注册图标，不需要动画
    provideNzI18n(zh_CN),
    importProvidersFrom(FormsModule)
  ]
};