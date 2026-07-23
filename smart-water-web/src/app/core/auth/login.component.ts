// src/app/core/auth/login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { AuthService } from './auth.service';
import { NotificationService } from '../notification.service'; // 引入全局通知

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCheckboxModule,
    NzIconModule
  ],
  templateUrl: './login.html',
  styles: [`
    .login-container {
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .login-box {
      width: 400px;
      padding: 40px;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
    }
    .login-title {
      text-align: center;
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 40px;
      color: #333;
    }
    .login-form {
      :host ::ng-deep .ant-input-affix-wrapper {
        height: 44px;
      }
      .login-btn {
        width: 100%;
        height: 44px;
        font-size: 16px;
        margin-top: 20px;
      }
      .login-options {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 16px;
      }
    }
  `]
})
export class LoginComponent {
  username = 'admin';
  password = '123456';
  remember = true;
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private notify: NotificationService // 替换原来的NzMessageService
  ) {}

  onSubmit(): void {
    if (!this.username || !this.password) {
      this.notify.warning('请输入用户名和密码'); // 使用全局通知
      return;
    }

    this.loading = true;
    this.authService.login({
      username: this.username,
      password: this.password,
      remember: this.remember
    }).subscribe({
      next: () => {
        this.loading = false;
        this.notify.success('登录成功'); // 使用全局通知
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.notify.error(err?.message || '登录失败，请检查用户名密码'); // 使用全局通知
      }
    });
  }
}