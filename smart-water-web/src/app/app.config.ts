import { ApplicationConfig, provideBrowserGlobalErrorListeners, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { NgxEchartsModule } from 'ngx-echarts';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/auth/auth.interceptor';
import { errorInterceptor } from './core/error.interceptor';
// 新增：图标注册
import { provideNzIcons } from 'ng-zorro-antd/icon';
import {
  SearchOutline,
  ReloadOutline,
  PlusOutline,
  CloseCircleOutline,
  WarningOutline
} from '@ant-design/icons-angular/icons';

registerLocaleData(en);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideNzI18n(en_US),
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor])
    ),
    importProvidersFrom(NgxEchartsModule.forRoot({ echarts: () => import('echarts') })),
    // 新增：全局注册图标
    provideNzIcons([
      SearchOutline,
      ReloadOutline,
      PlusOutline,
      CloseCircleOutline,
      WarningOutline
    ])
  ],
};