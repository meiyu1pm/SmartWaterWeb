# backend/app/modules/dashboard/router.py
from fastapi import APIRouter
from typing import List
from app.core.response import success_response

router = APIRouter()

# ============ Mock数据 ============
# 全局概览KPI
mock_overview_kpi: List[dict] = [
    {
        "title": "总供水量",
        "value": "12.86",
        "unit": "万m³",
        "color": "#1677ff",
        "trend": "+2.3%"
    },
    {
        "title": "今日供水量",
        "value": "3.42",
        "unit": "万m³",
        "color": "#52c41a",
        "trend": "+1.8%"
    },
    {
        "title": "平均管网压力",
        "value": "0.32",
        "unit": "MPa",
        "color": "#faad14",
        "trend": "-0.5%"
    },
    {
        "title": "管网漏损率",
        "value": "11.2",
        "unit": "%",
        "color": "#722ed1",
        "trend": "-0.8%"
    }
]

# 24小时总流量趋势
mock_flow_trend: List[dict] = [
    {"time": "00:00", "value": 1280},
    {"time": "01:00", "value": 1120},
    {"time": "02:00", "value": 980},
    {"time": "03:00", "value": 890},
    {"time": "04:00", "value": 850},
    {"time": "05:00", "value": 920},
    {"time": "06:00", "value": 1150},
    {"time": "07:00", "value": 1580},
    {"time": "08:00", "value": 1890},
    {"time": "09:00", "value": 2010},
    {"time": "10:00", "value": 1960},
    {"time": "11:00", "value": 1880},
    {"time": "12:00", "value": 1750},
    {"time": "13:00", "value": 1680},
    {"time": "14:00", "value": 1720},
    {"time": "15:00", "value": 1850},
    {"time": "16:00", "value": 1920},
    {"time": "17:00", "value": 2050},
    {"time": "18:00", "value": 1980},
    {"time": "19:00", "value": 1820},
    {"time": "20:00", "value": 1650},
    {"time": "21:00", "value": 1540},
    {"time": "22:00", "value": 1420},
    {"time": "23:00", "value": 1310}
]

# 最新告警动态
mock_latest_alarms: List[dict] = [
    {
        "time": "09:20",
        "area": "陇海路片区",
        "content": "下穿隧道积水触发红色预警",
        "level": "error"
    },
    {
        "time": "08:30",
        "area": "经三路DMA",
        "content": "夜间流量异常，疑似管道漏损",
        "level": "warning"
    },
    {
        "time": "07:15",
        "area": "纬二路片区",
        "content": "压力传感器数据冻结告警",
        "level": "warning"
    },
    {
        "time": "06:40",
        "area": "钻石花园小区",
        "content": "表具漂移校准完成",
        "level": "success"
    },
    {
        "time": "昨日22:10",
        "area": "中州大道立交",
        "content": "积水排除，交通恢复正常",
        "level": "success"
    }
]

# ============ 接口 ============
@router.get("/overview-kpi")
def get_overview_kpi():
    """获取全局概览KPI指标"""
    return success_response(mock_overview_kpi)

@router.get("/flow-trend")
def get_flow_trend():
    """获取全网24小时总流量趋势"""
    return success_response(mock_flow_trend)

@router.get("/latest-alarms")
def get_latest_alarms():
    """获取最新告警动态列表"""
    return success_response(mock_latest_alarms)