// src/app/core/utils/storage.util.ts
/**
 * 本地存储封装工具
 * 统一处理localStorage读写，自动JSON序列化/反序列化，异常捕获
 */

export const StorageUtil = {
  /**
   * 存储数据
   * @param key 存储键
   * @param value 存储值（自动序列化JSON）
   */
  set(key: string, value: any): void {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (e) {
      console.error('Storage set error:', e);
    }
  },

  /**
   * 获取数据
   * @param key 存储键
   * @param defaultValue 默认值
   * @returns 解析后的值
   */
  get<T = any>(key: string, defaultValue: T | null = null): T | null {
    try {
      const item = localStorage.getItem(key);
      if (item === null || item === undefined) {
        return defaultValue;
      }
      return JSON.parse(item) as T;
    } catch (e) {
      console.error('Storage get error:', e);
      return defaultValue;
    }
  },

  /**
   * 删除指定键
   * @param key 存储键
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Storage remove error:', e);
    }
  },

  /**
   * 清空所有本地存储
   */
  clear(): void {
    try {
      localStorage.clear();
    } catch (e) {
      console.error('Storage clear error:', e);
    }
  },

  /**
   * 检查是否存在指定键
   * @param key 存储键
   */
  has(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }
};

// 常用存储键常量
export const STORAGE_KEYS = {
  TOKEN: 'smart_water_token',
  USER_INFO: 'smart_water_user_info',
  REMEMBER_ME: 'smart_water_remember',
  SIDEBAR_COLLAPSED: 'smart_water_sidebar_collapsed'
} as const;