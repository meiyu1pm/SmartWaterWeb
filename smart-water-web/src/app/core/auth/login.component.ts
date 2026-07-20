import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AuthService, LoginRequest } from './auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule
  ],
  templateUrl: './login.html',
  styles: [`
    .login-wrapper {
      width: 100%;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f0f2f5;
    }
    .login-card {
      width: 400px;
    }
    .login-title {
      text-align: center;
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 24px;
      color: #1677ff;
    }
    .login-form-button {
      width: 100%;
    }
  `]
})
export class LoginComponent {
  loginForm: LoginRequest = {
    username: '',
    password: ''
  };
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private message: NzMessageService
  ) {}

  onLogin(): void {
    // 简单校验
    if (!this.loginForm.username || !this.loginForm.password) {
      this.message.warning('请输入用户名和密码');
      return;
    }

    this.loading = true;
    this.authService.login(this.loginForm).subscribe({
      next: (res) => {
        if (res.code === 0) {
          // 保存token
          this.authService.saveToken(res.data.access_token);
          this.message.success('登录成功');
          // 跳转到首页
          this.router.navigate(['/dashboard']);
        } else {
          this.message.error(res.message || '登录失败');
        }
      },
      error: () => {
        this.message.error('登录请求失败，请检查后端服务');
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}
