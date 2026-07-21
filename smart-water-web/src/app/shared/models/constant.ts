/**
 * 全局统一常量定义
 * 所有状态、下拉选项统一写在这里，禁止页面手写数字/文字
 * 直接 import 使用，不要重复定义
 */

/* ============ 数据源类型 ============ */
export const DATA_SOURCE_TYPE = {
  FILE: 'file',
  DATABASE: 'database',
  API: 'api',
  WEBSOCKET: 'websocket',
  MQTT: 'mqtt',
  MESSAGE_QUEUE: 'mq'
} as const;

export const DATA_SOURCE_TYPE_TEXT: Record<string, string> = {
  [DATA_SOURCE_TYPE.FILE]: '文件',
  [DATA_SOURCE_TYPE.DATABASE]: '数据库',
  [DATA_SOURCE_TYPE.API]: 'API接口',
  [DATA_SOURCE_TYPE.WEBSOCKET]: 'WebSocket',
  [DATA_SOURCE_TYPE.MQTT]: 'MQTT',
  [DATA_SOURCE_TYPE.MESSAGE_QUEUE]: '消息队列'
};

/* 数据源类型下拉选项 */
export const DATA_SOURCE_TYPE_OPTIONS = Object.keys(DATA_SOURCE_TYPE_TEXT).map(value => ({
  label: DATA_SOURCE_TYPE_TEXT[value],
  value
}));

/* ============ 数据源状态 ============ */
export const DATA_SOURCE_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  ERROR: 'error'
} as const;

export const DATA_SOURCE_STATUS_TEXT: Record<string, string> = {
  [DATA_SOURCE_STATUS.ONLINE]: '在线',
  [DATA_SOURCE_STATUS.OFFLINE]: '离线',
  [DATA_SOURCE_STATUS.ERROR]: '异常'
};

/* 状态对应颜色：正常#52c41a绿、预警#faad14黄、高危#f5222d红 */
export const DATA_SOURCE_STATUS_COLOR: Record<string, string> = {
  [DATA_SOURCE_STATUS.ONLINE]: '#52c41a',
  [DATA_SOURCE_STATUS.OFFLINE]: '#faad14',
  [DATA_SOURCE_STATUS.ERROR]: '#f5222d'
};

/* 状态下拉选项 */
export const DATA_SOURCE_STATUS_OPTIONS = Object.keys(DATA_SOURCE_STATUS_TEXT).map(value => ({
  label: DATA_SOURCE_STATUS_TEXT[value],
  value
}));

/* ============ 通信协议 ============ */
export const DATA_PROTOCOL = {
  MQTT: 'mqtt',
  HTTP: 'http',
  HTTPS: 'https',
  MODBUS: 'modbus',
  TCP: 'tcp',
  JDBC: 'jdbc',
  WEBSOCKET: 'websocket'
} as const;

export const DATA_PROTOCOL_TEXT: Record<string, string> = {
  [DATA_PROTOCOL.MQTT]: 'MQTT',
  [DATA_PROTOCOL.HTTP]: 'HTTP',
  [DATA_PROTOCOL.HTTPS]: 'HTTPS',
  [DATA_PROTOCOL.MODBUS]: 'Modbus',
  [DATA_PROTOCOL.TCP]: 'TCP',
  [DATA_PROTOCOL.JDBC]: 'JDBC',
  [DATA_PROTOCOL.WEBSOCKET]: 'WebSocket'
};

export const DATA_PROTOCOL_OPTIONS = Object.keys(DATA_PROTOCOL_TEXT).map(value => ({
  label: DATA_PROTOCOL_TEXT[value],
  value
}));

/* ============ 告警状态（全局通用） ============ */
export const ALARM_STATUS = {
  OPEN: 'open',
  HANDLED: 'handled',
  CLOSED: 'closed'
} as const;

export const ALARM_STATUS_TEXT: Record<string, string> = {
  [ALARM_STATUS.OPEN]: '未处置',
  [ALARM_STATUS.HANDLED]: '处理中',
  [ALARM_STATUS.CLOSED]: '已归档'
};

/* ============ 通用分页参数 ============ */
export const PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

/* ============ 主题色 ============ */
export const THEME_COLOR = {
  PRIMARY: '#1677ff',
  SUCCESS: '#52c41a',
  WARNING: '#faad14',
  DANGER: '#f5222d',
  PURPLE: '#722ed1',
  ORANGE: '#fa8c16'
} as const;

/* ============ 数据质量检测类型 ============ */
export const QUALITY_TYPE = {
  MISSING: 'missing',           // 缺失
  DUPLICATE: 'duplicate',       // 重复
  OUTLIER: 'outlier',           // 离群
  FREEZE: 'freeze',             // 冻结
  DRIFT: 'drift',               // 漂移
  NEGATIVE_FLOW: 'negative_flow',     // 负流量
  PRESSURE_OOR: 'pressure_oor',       // 压力越界
  JUMP: 'jump'                  // 跳变
} as const;

export const QUALITY_TYPE_TEXT: Record<string, string> = {
  [QUALITY_TYPE.MISSING]: '数据缺失',
  [QUALITY_TYPE.DUPLICATE]: '数据重复',
  [QUALITY_TYPE.OUTLIER]: '离群异常',
  [QUALITY_TYPE.FREEZE]: '数据冻结',
  [QUALITY_TYPE.DRIFT]: '数据漂移',
  [QUALITY_TYPE.NEGATIVE_FLOW]: '负流量',
  [QUALITY_TYPE.PRESSURE_OOR]: '压力越界',
  [QUALITY_TYPE.JUMP]: '数值跳变'
};

/* 质量类型下拉选项 */
export const QUALITY_TYPE_OPTIONS = Object.keys(QUALITY_TYPE_TEXT).map(value => ({
  label: QUALITY_TYPE_TEXT[value],
  value
}));

/* 质量类型对应标签颜色 */
export const QUALITY_TYPE_TAG_COLOR: Record<string, string> = {
  [QUALITY_TYPE.MISSING]: 'orange',
  [QUALITY_TYPE.DUPLICATE]: 'blue',
  [QUALITY_TYPE.OUTLIER]: 'red',
  [QUALITY_TYPE.FREEZE]: 'purple',
  [QUALITY_TYPE.DRIFT]: 'cyan',
  [QUALITY_TYPE.NEGATIVE_FLOW]: 'red',
  [QUALITY_TYPE.PRESSURE_OOR]: 'magenta',
  [QUALITY_TYPE.JUMP]: 'gold'
};

/* ============ 数据质量等级 ============ */
export const QUALITY_LEVEL = {
  EXCELLENT: 'excellent',  // 优秀 >=90
  GOOD: 'good',            // 良好 80-89
  WARNING: 'warning',      // 预警 60-79
  POOR: 'poor'             // 差 <60
} as const;

export const QUALITY_LEVEL_TEXT: Record<string, string> = {
  [QUALITY_LEVEL.EXCELLENT]: '优秀',
  [QUALITY_LEVEL.GOOD]: '良好',
  [QUALITY_LEVEL.WARNING]: '预警',
  [QUALITY_LEVEL.POOR]: '差'
};

/* 质量等级对应颜色：正常#52c41a绿、预警#faad14黄、高危#f5222d红 */
export const QUALITY_LEVEL_COLOR: Record<string, string> = {
  [QUALITY_LEVEL.EXCELLENT]: '#52c41a',
  [QUALITY_LEVEL.GOOD]: '#1677ff',
  [QUALITY_LEVEL.WARNING]: '#faad14',
  [QUALITY_LEVEL.POOR]: '#f5222d'
};

/* 质量等级下拉选项 */
export const QUALITY_LEVEL_OPTIONS = Object.keys(QUALITY_LEVEL_TEXT).map(value => ({
  label: QUALITY_LEVEL_TEXT[value],
  value
}));

/* 根据Qscore获取质量等级 */
export function getQualityLevel(score: number): string {
  if (score >= 90) return QUALITY_LEVEL.EXCELLENT;
  if (score >= 80) return QUALITY_LEVEL.GOOD;
  if (score >= 60) return QUALITY_LEVEL.WARNING;
  return QUALITY_LEVEL.POOR;
}

/* ============ 分析任务状态 ============ */
export const TASK_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  SUCCESS: 'success',
  FAILED: 'failed'
} as const;

export const TASK_STATUS_TEXT: Record<string, string> = {
  [TASK_STATUS.PENDING]: '等待中',
  [TASK_STATUS.RUNNING]: '分析中',
  [TASK_STATUS.SUCCESS]: '已完成',
  [TASK_STATUS.FAILED]: '失败'
};

/* ============ 监测指标类型 ============ */
export const METRIC_CODE_TEXT: Record<string, string> = {
  flow: '流量',
  pressure: '压力',
  volume: '累计水量',
  quality: '水质'
};
