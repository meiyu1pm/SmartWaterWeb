// src/app/core/utils/storage.util.ts
export const STORAGE_KEYS = {
  TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_INFO: 'user_info',
  REMEMBER_ME: 'remember_me'
} as const;

export class StorageUtil {
  /**
   * 存储数据
   */
  static set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage set error:', e);
    }
  }

  /**
   * 获取数据
   */
  static get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error('Storage get error:', e);
      return null;
    }
  }

  /**
   * 删除数据
   */
  static remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Storage remove error:', e);
    }
  }

  /**
   * 清空所有存储
   */
  static clear(): void {
    try {
      localStorage.clear();
    } catch (e) {
      console.error('Storage clear error:', e);
    }
  }
}