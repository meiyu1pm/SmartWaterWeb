# backend/app/modules/waterlogging/router.py
import random
import math
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from app.core.response import success_response

router = APIRouter()


# ============ 数据模型 ============
class WaterloggingKpi(BaseModel):
    title: str
    value: str
    unit: str
    color: str


class PondingPoint(BaseModel):
    id: int
    name: str
    area: str
    waterDepth: float
    level: str  # 蓝色/黄色/橙色/红色预警
    status: str
    updateTime: str


class RainRiverFlowData(BaseModel):
    time: str
    rainfall: float
    waterLevel: float
    flow: float


class PumpStatus(BaseModel):
    id: int
    name: str
    status: str  # running/stopped/fault
    currentFlow: float
    designFlow: float
    power: float


class WaterloggingAlarm(BaseModel):
    id: int
    time: str
    level: str
    content: str
    location: str
    status: str  # unhandled/handling/handled


class DispatchPlan(BaseModel):
    id: int
    name: str
    level: str
    content: str
    suggestion: str


# ============ Mock数据 ============
def generate_rain_flow_data():
    data = []
    for i in range(24):
        hour = f"{str(i).zfill(2)}:00"
        # 模拟降雨：凌晨到上午降雨多
        if 3 <= i <= 9:
            rain = round(random.uniform(5, 25) + math.sin(i/2)*8, 1)
        else:
            rain = round(random.uniform(0, 5), 1)
        # 水位随降雨变化
        level = round(2.5 + rain * 0.08 + random.uniform(-0.1, 0.2), 2)
        # 流量随水位变化
        flow = round(level * 12 + random.uniform(-2, 3), 1)
        data.append(RainRiverFlowData(
            time=hour,
            rainfall=rain,
            waterLevel=level,
            flow=flow
        ))
    return data


mock_ponding_points = [
    PondingPoint(id=1, name="经三路与纬二路交叉口", area="金水区", waterDepth=32, level="橙色预警", status="积水中", updateTime="2026-07-22 09:15:00"),
    PondingPoint(id=2, name="航海路下穿隧道", area="二七区", waterDepth=18, level="黄色预警", status="退水中", updateTime="2026-07-22 09:10:00"),
    PondingPoint(id=3, name="中州大道农业路立交", area="金水区", waterDepth=8, level="蓝色预警", status="已处置", updateTime="2026-07-22 08:45:00"),
    PondingPoint(id=4, name="陇海路快速通道下口", area="管城区", waterDepth=45, level="红色预警", status="交通管制", updateTime="2026-07-22 09:20:00"),
    PondingPoint(id=5, name="南三环紫荆山南路", area="管城回族区", waterDepth=12, level="蓝色预警", status="巡查中", updateTime="2026-07-22 09:05:00"),
]

mock_pumps = [
    PumpStatus(id=1, name="1号泵站（金水路）", status="running", currentFlow=1280, designFlow=1500, power=85),
    PumpStatus(id=2, name="2号泵站（航海路）", status="running", currentFlow=960, designFlow=1200, power=80),
    PumpStatus(id=3, name="3号泵站（中州大道）", status="running", currentFlow=1420, designFlow=1800, power=78),
    PumpStatus(id=4, name="4号泵站（陇海路）", status="fault", currentFlow=0, designFlow=1000, power=0),
    PumpStatus(id=5, name="5号泵站（南三环）", status="stopped", currentFlow=0, designFlow=800, power=0),
]

mock_alarms = [
    WaterloggingAlarm(id=1, time="2026-07-22 09:20:00", level="红色", content="陇海路下穿隧道积水超过40cm", location="陇海路快速通道下口", status="unhandled"),
    WaterloggingAlarm(id=2, time="2026-07-22 09:15:00", level="橙色", content="经三路纬二路积水超过30cm", location="经三路与纬二路交叉口", status="handling"),
    WaterloggingAlarm(id=3, time="2026-07-22 09:02:00", level="黄色", content="4号泵站故障停机", location="陇海路泵站", status="handling"),
    WaterloggingAlarm(id=4, time="2026-07-22 08:45:00", level="蓝色", content="中州大道立交积水已排除", location="中州大道农业路立交", status="handled"),
    WaterloggingAlarm(id=5, time="2026-07-22 08:30:00", level="黄色", content="未来路小时降雨量超过30mm", location="未来路沿线", status="handled"),
]

mock_plans = [
    DispatchPlan(id=1, name="红色预警一级响应", level="红色", content="立即启动一级排涝预案", suggestion="关闭陇海路隧道交通，增派2台移动泵车，通知交警支队疏导交通"),
    DispatchPlan(id=2, name="橙色预警二级响应", level="橙色", content="启动二级排涝预案", suggestion="经三路区域开启全部泵站，安排人员现场值守，通知周边小区注意防范"),
    DispatchPlan(id=3, name="泵站故障应急预案", level="橙色", content="4号泵站故障应急处置", suggestion="立即派维修人员赶赴现场，临时调派3号泵站分流，通知交通部门提前疏导"),
]


# ============ 接口 ============
@router.get("/kpi")
def get_waterlogging_kpi(area: str = "all"):
    data = [
        WaterloggingKpi(title="24小时累计降雨量", value="86.5", unit="mm", color="#1677ff"),
        WaterloggingKpi(title="当前积水点", value="5", unit="处", color="#faad14"),
        WaterloggingKpi(title="运行泵站", value="3", unit="台", color="#52c41a"),
        WaterloggingKpi(title="未处置告警", value="2", unit="条", color="#f5222d"),
    ]
    return success_response(data)


@router.get("/ponding-points")
def get_ponding_points():
    return success_response(mock_ponding_points)


@router.get("/rain-river-flow")
def get_rain_river_flow():
    return success_response(generate_rain_flow_data())


@router.get("/pump-status")
def get_pump_status():
    return success_response(mock_pumps)


@router.get("/alarms")
def get_waterlogging_alarms():
    return success_response(mock_alarms)


@router.get("/dispatch-plans")
def get_dispatch_plans():
    return success_response(mock_plans)