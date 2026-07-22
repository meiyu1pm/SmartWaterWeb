// src/app/core/utils/date.util.ts
/**
 * 时间格式化工具
 * 统一处理日期时间显示、转换、计算
 */

/**
 * 格式化时间
 * @param date 时间对象/时间戳/时间字符串
 * @param format 格式化模板，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的时间字符串
 */
export function formatDate(date: Date | number | string, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  if (!date) return '';
  
  let d: Date;
  if (typeof date === 'number') {
    d = new Date(date);
  } else if (typeof date === 'string') {
    d = new Date(date);
  } else {
    d = date;
  }

  if (isNaN(d.getTime())) return '';

  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hour = d.getHours();
  const minute = d.getMinutes();
  const second = d.getSeconds();
  const millisecond = d.getMilliseconds();

  return format
    .replace('YYYY', String(year))
    .replace('MM', String(month).padStart(2, '0'))
    .replace('DD', String(day).padStart(2, '0'))
    .replace('HH', String(hour).padStart(2, '0'))
    .replace('mm', String(minute).padStart(2, '0'))
    .replace('ss', String(second).padStart(2, '0'))
    .replace('SSS', String(millisecond).padStart(3, '0'));
}

/**
 * 格式化为日期（仅年月日）
 */
export function formatDateOnly(date: Date | number | string): string {
  return formatDate(date, 'YYYY-MM-DD');
}

/**
 * 格式化为时间（仅时分秒）
 */
export function formatTimeOnly(date: Date | number | string): string {
  return formatDate(date, 'HH:mm:ss');
}

/**
 * 获取今日0点时间戳
 */
export function getTodayStart(): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.getTime();
}

/**
 * 获取今日23:59:59时间戳
 */
export function getTodayEnd(): number {
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  return now.getTime();
}

/**
 * 获取相对时间描述
 * 例如：刚刚、5分钟前、1小时前、3天前
 */
export function getRelativeTime(date: Date | number | string): string {
  if (!date) return '';
  
  let d: Date;
  if (typeof date === 'number') {
    d = new Date(date);
  } else if (typeof date === 'string') {
    d = new Date(date);
  } else {
    d = date;
  }

  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  if (days < 30) return `${Math.floor(days / 7)}周前`;
  
  return formatDateOnly(d);
}

/**
 * 计算两个时间的差值（毫秒）
 */
export function timeDiff(start: Date | number | string, end: Date | number | string): number {
  const startDate = new Date(start).getTime();
  const endDate = new Date(end).getTime();
  return endDate - startDate;
}

/**
 * 给时间增加天数
 */
export function addDays(date: Date | number | string, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}