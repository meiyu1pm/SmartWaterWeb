// src/app/core/auth/permission.service.ts
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  constructor(private authService: AuthService) {}

  /**
   * 判断是否拥有指定权限
   * @param permission 权限码，如 'data_source:write'
   */
  hasPerm(permission: string): boolean {
    const permissions = this.authService.getPermissions();
    // admin 角色默认拥有全部权限
    const roles = this.authService.getUserInfo()?.roles || [];
    if (roles.includes('admin')) {
      return true;
    }
    return permissions.includes(permission);
  }

  /**
   * 判断是否拥有指定权限中的任意一个
   * @param permissions 权限码数组
   */
  hasAnyPerm(permissions: string[]): boolean {
    return permissions.some(p => this.hasPerm(p));
  }

  /**
   * 判断是否拥有全部指定权限
   * @param permissions 权限码数组
   */
  hasAllPerm(permissions: string[]): boolean {
    return permissions.every(p => this.hasPerm(p));
  }
}