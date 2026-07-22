# backend/app/modules/alarm/router.py
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict
from app.core.response import success_response, format_now

router = APIRouter()


# ============ 数据模型 ============
class AlarmItem(BaseModel):
    id: int
    alarmNo: str
    title: str
    type: str  # leakage/waterlogging/quality/device
    level: str  # blue/yellow/orange/red
    source: str
    location: str
    description: str
    status: str  # pending/processing/handled/closed
    handler: str | None = None
    createTime: str
    updateTime: str


class AlarmDisposeRecord(BaseModel):
    id: int
    alarmId: int
    action: str  # confirm/dispatch/process/close
    operator: str
    remark: str
    createTime: str


class DisposeRequest(BaseModel):
    action: str  # confirm/dispatch/process/close
    remark: str = ""
    handler: str = ""


# ============ Mock数据 ============
mock_alarms: List[dict] = [
    {
        "id": 1,
        "alarmNo": "ALM-20260722-0001",
        "title": "陇海路下穿隧道严重积水",
        "type": "waterlogging",
        "level": "red",
        "source": "内涝监测系统",
        "location": "陇海路快速通道下口",
        "description": "当前水深45cm，超过警戒水位10cm，建议封闭交通，启动强排",
        "status": "pending",
        "handler": None,
        "createTime": "2026-07-22 09:20:00",
        "updateTime": "2026-07-22 09:20:00"
    },
    {
        "id": 2,
        "alarmNo": "ALM-20260722-0002",
        "title": "经三路流量突变异常",
        "type": "leakage",
        "level": "orange",
        "source": "漏损检测模型",
        "location": "FT-007 流量计",
        "description": "凌晨02:15流量突增35%，疑似管道漏损，异常评分87.2",
        "status": "processing",
        "handler": "张工",
        "createTime": "2026-07-22 02:15:00",
        "updateTime": "2026-07-22 08:30:00"
    },
    {
        "id": 3,
        "alarmNo": "ALM-20260722-0003",
        "title": "纬二路压力数据冻结",
        "type": "quality",
        "level": "yellow",
        "source": "数据质量检测",
        "location": "PT-002 压力计",
        "description": "压力值持续24小时恒定0.32MPa，疑似传感器冻结，质量评分58.3",
        "status": "processing",
        "handler": "李工",
        "createTime": "2026-07-22 12:30:00",
        "updateTime": "2026-07-22 13:00:00"
    },
    {
        "id": 4,
        "alarmNo": "ALM-20260721-0004",
        "title": "4号泵站故障停机",
        "type": "device",
        "level": "orange",
        "source": "设备监控系统",
        "location": "陇海路泵站",
        "description": "泵站主泵故障停机，已影响排水能力，需紧急维修",
        "status": "processing",
        "handler": "王班长",
        "createTime": "2026-07-22 09:02:00",
        "updateTime": "2026-07-22 09:15:00"
    },
    {
        "id": 5,
        "alarmNo": "ALM-20260721-0005",
        "title": "钻石花园夜间流量异常",
        "type": "leakage",
        "level": "yellow",
        "source": "漏损检测模型",
        "location": "FT-004 流量计",
        "description": "夜间最小流量持续上升，本周已增长27%，疑似暗漏",
        "status": "handled",
        "handler": "张工",
        "createTime": "2026-07-21 23:45:00",
        "updateTime": "2026-07-22 07:00:00"
    },
    {
        "id": 6,
        "alarmNo": "ALM-20260721-0006",
        "title": "中州大道立交积水排除",
        "type": "waterlogging",
        "level": "blue",
        "source": "内涝监测系统",
        "location": "中州大道农业路立交",
        "description": "积水已排除，交通恢复正常",
        "status": "closed",
        "handler": "李工",
        "createTime": "2026-07-22 08:00:00",
        "updateTime": "2026-07-22 08:45:00"
    },
    {
        "id": 7,
        "alarmNo": "ALM-20260721-0007",
        "title": "FT-012传感器故障",
        "type": "device",
        "level": "yellow",
        "source": "设备监控系统",
        "location": "纬二路片区流量计B",
        "description": "传感器通信异常，数据断续，已安排维护",
        "status": "handled",
        "handler": "运维组",
        "createTime": "2026-07-21 10:18:00",
        "updateTime": "2026-07-21 16:30:00"
    },
    {
        "id": 8,
        "alarmNo": "ALM-20260720-0008",
        "title": "钻石花园DMA压力数据缺失",
        "type": "quality",
        "level": "orange",
        "source": "数据质量检测",
        "location": "PT-015 压力计",
        "description": "设备离线期间960条数据全部缺失，质量评分55.2",
        "status": "closed",
        "handler": "李工",
        "createTime": "2026-07-20 08:15:00",
        "updateTime": "2026-07-20 22:00:00"
    },
]

mock_dispose_records: Dict[int, List[dict]] = {
    2: [
        {"id": 1, "alarmId": 2, "action": "confirm", "operator": "系统自动", "remark": "异常检测模型触发告警", "createTime": "2026-07-22 02:15:00"},
        {"id": 2, "alarmId": 2, "action": "dispatch", "operator": "调度中心", "remark": "派单给张工现场核查", "createTime": "2026-07-22 08:30:00"},
    ],
    3: [
        {"id": 1, "alarmId": 3, "action": "confirm", "operator": "系统自动", "remark": "质量检测触发告警", "createTime": "2026-07-22 12:30:00"},
        {"id": 2, "alarmId": 3, "action": "dispatch", "operator": "调度中心", "remark": "派单给李工检查传感器", "createTime": "2026-07-22 13:00:00"},
    ],
    5: [
        {"id": 1, "alarmId": 5, "action": "confirm", "operator": "系统自动", "remark": "漏损模型触发告警", "createTime": "2026-07-21 23:45:00"},
        {"id": 2, "alarmId": 5, "action": "dispatch", "operator": "调度中心", "remark": "派单给张工", "createTime": "2026-07-22 06:00:00"},
        {"id": 3, "alarmId": 5, "action": "process", "operator": "张工", "remark": "现场核查为表具漂移，已校准", "createTime": "2026-07-22 06:45:00"},
        {"id": 4, "alarmId": 5, "action": "close", "operator": "张工", "remark": "问题已解决，告警关闭", "createTime": "2026-07-22 07:00:00"},
    ],
}


# ============ 接口 ============
@router.get("/kpi")
def get_alarm_kpi():
    """告警统计KPI"""
    total = len(mock_alarms)
    pending = sum(1 for a in mock_alarms if a["status"] == "pending")
    processing = sum(1 for a in mock_alarms if a["status"] == "processing")
    today = sum(1 for a in mock_alarms if a["createTime"].startswith("2026-07-22"))
    data = [
        {"title": "告警总数", "value": str(total), "unit": "条", "color": "#1677ff"},
        {"title": "待处理", "value": str(pending), "unit": "条", "color": "#f5222d"},
        {"title": "处理中", "value": str(processing), "unit": "条", "color": "#faad14"},
        {"title": "今日新增", "value": str(today), "unit": "条", "color": "#722ed1"},
    ]
    return success_response(data)


@router.get("")
def get_alarm_list(
    keyword: str = "",
    type: str = "",
    level: str = "",
    status: str = "",
    pageIndex: int = 1,
    pageSize: int = 10
):
    """告警列表，支持筛选分页"""
    filtered = list(mock_alarms)
    if keyword:
        kw = keyword.lower()
        filtered = [a for a in filtered if kw in a["title"].lower() or kw in a["alarmNo"].lower()]
    if type:
        filtered = [a for a in filtered if a["type"] == type]
    if level:
        filtered = [a for a in filtered if a["level"] == level]
    if status:
        filtered = [a for a in filtered if a["status"] == status]

    # 按创建时间倒序
    filtered.sort(key=lambda x: x["createTime"], reverse=True)

    start = (pageIndex - 1) * pageSize
    end = start + pageSize
    page_list = filtered[start:end]
    return success_response({"list": page_list, "total": len(filtered)})


@router.get("/{alarm_id}")
def get_alarm_detail(alarm_id: int):
    """告警详情"""
    alarm = next((a for a in mock_alarms if a["id"] == alarm_id), None)
    if not alarm:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Alarm not found")
    return success_response(alarm)


@router.get("/{alarm_id}/records")
def get_dispose_records(alarm_id: int):
    """处置记录时间轴"""
    records = mock_dispose_records.get(alarm_id, [])
    if not records:
        alarm = next((a for a in mock_alarms if a["id"] == alarm_id), None)
        if alarm:
            records = [
                {"id": 1, "alarmId": alarm_id, "action": "confirm", "operator": "系统自动", "remark": "告警触发", "createTime": alarm["createTime"]}
            ]
    return success_response(records)


@router.post("/{alarm_id}/dispose")
def dispose_alarm(alarm_id: int, req: DisposeRequest):
    """处置告警：确认/派单/处理/关闭"""
    global mock_alarms
    alarm = next((a for a in mock_alarms if a["id"] == alarm_id), None)
    if not alarm:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Alarm not found")

    # 更新告警状态
    status_map = {
        "confirm": "processing",
        "dispatch": "processing",
        "process": "processing",
        "close": "closed"
    }
    if req.action in status_map:
        alarm["status"] = status_map[req.action]
    if req.handler:
        alarm["handler"] = req.handler
    alarm["updateTime"] = format_now()

    # 添加处置记录
    if alarm_id not in mock_dispose_records:
        mock_dispose_records[alarm_id] = []
    new_record = {
        "id": len(mock_dispose_records[alarm_id]) + 1,
        "alarmId": alarm_id,
        "action": req.action,
        "operator": req.handler or "当前用户",
        "remark": req.remark,
        "createTime": format_now()
    }
    mock_dispose_records[alarm_id].append(new_record)

    return success_response(alarm)