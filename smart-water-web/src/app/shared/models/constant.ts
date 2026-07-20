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