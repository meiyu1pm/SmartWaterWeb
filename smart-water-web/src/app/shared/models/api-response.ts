/**
 * 后端统一响应格式
 * 与开发手册约定对齐
 */
export interface ApiResponse<T> {
  code: number;       // 状态码，0表示成功
  message: string;    // 提示信息
  data: T;            // 业务数据
  trace_id: string;   // 请求追踪ID
}

/**
 * 通用分页结果封装
 * 所有列表分页接口统一使用
 */
export interface PageResult<T> {
  list: T[];
  total: number;
}