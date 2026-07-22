# backend/app/modules/data_source/router.py
from fastapi import APIRouter
from pydantic import BaseModel
from app.core.response import success_response, format_now

router = APIRouter()


# ============ 数据模型 ============
class DataSourceItem(BaseModel):
    id: int
    sourceCode: str
    sourceName: str
    sourceType: str
    protocol: str
    endpoint: str
    port: int | None = None
    collectInterval: str
    status: str
    ownerOrg: str
    lastUpdateTime: str
    remark: str


class DataSourceKpiItem(BaseModel):
    title: str
    value: str
    unit: str
    color: str


class DataSourceFormValue(BaseModel):
    id: int | None = None
    sourceCode: str
    sourceName: str
    sourceType: str
    protocol: str
    endpoint: str
    port: int | None = None
    collectInterval: str
    ownerOrg: str
    remark: str


# ============ Mock数据 ============
mock_data_sources: list[dict] = [
    {"id": 1, "sourceCode": "DS-FT-001", "sourceName": "经开6分区流量计", "sourceType": "mqtt", "protocol": "mqtt", "endpoint": "192.168.10.21", "port": 1883, "collectInterval": "15s", "status": "online", "ownerOrg": "经开供水所", "lastUpdateTime": "2026-07-20 13:10:22", "remark": "DMA分区入口流量"},
    {"id": 2, "sourceCode": "DS-PT-002", "sourceName": "纬二路压力监测点", "sourceType": "mqtt", "protocol": "mqtt", "endpoint": "192.168.10.35", "port": 1883, "collectInterval": "30s", "status": "online", "ownerOrg": "市政管网科", "lastUpdateTime": "2026-07-20 13:08:15", "remark": "管网末端压力"},
    {"id": 3, "sourceCode": "DS-DB-003", "sourceName": "远传水表数据库", "sourceType": "database", "protocol": "jdbc", "endpoint": "10.0.20.100:5432/water_meter", "port": 5432, "collectInterval": "1h", "status": "online", "ownerOrg": "信息中心", "lastUpdateTime": "2026-07-20 12:00:00", "remark": "PostgreSQL 日度抄表"},
    {"id": 4, "sourceCode": "DS-FT-004", "sourceName": "钻石花园DMA流量计", "sourceType": "mqtt", "protocol": "mqtt", "endpoint": "192.168.10.52", "port": 1883, "collectInterval": "15s", "status": "offline", "ownerOrg": "经开供水所", "lastUpdateTime": "2026-07-20 09:22:41", "remark": "设备离线超过2小时"},
    {"id": 5, "sourceCode": "DS-API-005", "sourceName": "气象局降雨量API", "sourceType": "api", "protocol": "https", "endpoint": "api.weather.gov.cn/rainfall", "port": 443, "collectInterval": "10min", "status": "online", "ownerOrg": "防汛办", "lastUpdateTime": "2026-07-20 13:05:00", "remark": "第三方气象数据"},
    {"id": 6, "sourceCode": "DS-FT-006", "sourceName": "朗诗东山樾流量计", "sourceType": "mqtt", "protocol": "mqtt", "endpoint": "192.168.10.68", "port": 1883, "collectInterval": "15s", "status": "error", "ownerOrg": "经开供水所", "lastUpdateTime": "2026-07-20 11:45:33", "remark": "通信异常，数据断续"},
    {"id": 7, "sourceCode": "DS-WS-007", "sourceName": "泵站运行状态WebSocket", "sourceType": "websocket", "protocol": "websocket", "endpoint": "ws://10.0.20.55:8080/pump", "port": 8080, "collectInterval": "实时", "status": "online", "ownerOrg": "泵站管理科", "lastUpdateTime": "2026-07-20 13:12:01", "remark": "泵站实时遥测"},
    {"id": 8, "sourceCode": "DS-DB-008", "sourceName": "机械表月度抄表Excel", "sourceType": "file", "protocol": "http", "endpoint": "/upload/monthly_meter.xlsx", "port": None, "collectInterval": "月度", "status": "offline", "ownerOrg": "营业所", "lastUpdateTime": "2026-07-18 08:30:00", "remark": "每月5日人工导入"},
    {"id": 9, "sourceCode": "DS-PT-009", "sourceName": "三级管网9区压力计", "sourceType": "mqtt", "protocol": "tcp", "endpoint": "192.168.10.77", "port": 502, "collectInterval": "30s", "status": "online", "ownerOrg": "市政管网科", "lastUpdateTime": "2026-07-20 13:11:45", "remark": "Modbus TCP 采集"},
    {"id": 10, "sourceCode": "DS-FT-010", "sourceName": "总表FT-003流量计", "sourceType": "mqtt", "protocol": "mqtt", "endpoint": "192.168.10.10", "port": 1883, "collectInterval": "15s", "status": "online", "ownerOrg": "水厂中控", "lastUpdateTime": "2026-07-20 13:12:30", "remark": "出厂总管流量"},
    {"id": 11, "sourceCode": "DS-MQ-011", "sourceName": "水质监测消息队列", "sourceType": "mq", "protocol": "mqtt", "endpoint": "broker.water.local", "port": 1883, "collectInterval": "1min", "status": "online", "ownerOrg": "水质检测中心", "lastUpdateTime": "2026-07-20 13:10:55", "remark": "浊度/余氯/PH"},
    {"id": 12, "sourceCode": "DS-FT-012", "sourceName": "纬二路片区流量计B", "sourceType": "mqtt", "protocol": "mqtt", "endpoint": "192.168.10.36", "port": 1883, "collectInterval": "15s", "status": "error", "ownerOrg": "市政管网科", "lastUpdateTime": "2026-07-20 10:18:22", "remark": "传感器故障"},
    {"id": 13, "sourceCode": "DS-DB-013", "sourceName": "管网拓扑模型库", "sourceType": "database", "protocol": "jdbc", "endpoint": "10.0.20.101:5432/gis_network", "port": 5432, "collectInterval": "日度", "status": "online", "ownerOrg": "信息中心", "lastUpdateTime": "2026-07-20 06:00:00", "remark": "EPANET 拓扑"},
    {"id": 14, "sourceCode": "DS-API-014", "sourceName": "SCADA系统数据接口", "sourceType": "api", "protocol": "http", "endpoint": "scada.water.local/api/v2/realtime", "port": 8080, "collectInterval": "5s", "status": "online", "ownerOrg": "水厂中控", "lastUpdateTime": "2026-07-20 13:12:50", "remark": "SCADA 实时数据"},
    {"id": 15, "sourceCode": "DS-PT-015", "sourceName": "钻石花园DMA压力计", "sourceType": "mqtt", "protocol": "mqtt", "endpoint": "192.168.10.53", "port": 1883, "collectInterval": "30s", "status": "offline", "ownerOrg": "经开供水所", "lastUpdateTime": "2026-07-19 22:15:00", "remark": "计划维护停机"},
]
next_ds_id = 16


# ============ 接口 ============
@router.get("/kpi")
def get_data_source_kpi():
    total = len(mock_data_sources)
    online = sum(1 for d in mock_data_sources if d["status"] == "online")
    offline = sum(1 for d in mock_data_sources if d["status"] == "offline")
    error = sum(1 for d in mock_data_sources if d["status"] == "error")
    data = [
        DataSourceKpiItem(title="数据源总数", value=str(total), unit="个", color="#1677ff"),
        DataSourceKpiItem(title="在线数据源", value=str(online), unit="个", color="#52c41a"),
        DataSourceKpiItem(title="离线数据源", value=str(offline), unit="个", color="#faad14"),
        DataSourceKpiItem(title="异常数据源", value=str(error), unit="个", color="#f5222d"),
    ]
    return success_response(data)


@router.get("")
def get_data_source_list(
    keyword: str = "",
    sourceType: str = "",
    status: str = "",
    pageIndex: int = 1,
    pageSize: int = 10
):
    filtered = list(mock_data_sources)
    if keyword:
        kw = keyword.lower()
        filtered = [d for d in filtered if kw in d["sourceCode"].lower() or kw in d["sourceName"].lower()]
    if sourceType:
        filtered = [d for d in filtered if d["sourceType"] == sourceType]
    if status:
        filtered = [d for d in filtered if d["status"] == status]

    start = (pageIndex - 1) * pageSize
    end = start + pageSize
    page_list = filtered[start:end]
    return success_response({"list": page_list, "total": len(filtered)})


@router.post("")
def create_data_source(form: DataSourceFormValue):
    global next_ds_id
    new_item = form.model_dump()
    new_item["id"] = next_ds_id
    new_item["status"] = "offline"
    new_item["lastUpdateTime"] = format_now()
    next_ds_id += 1
    mock_data_sources.insert(0, new_item)
    return success_response(new_item)


@router.put("/{source_id}")
def update_data_source(source_id: int, form: DataSourceFormValue):
    for i, d in enumerate(mock_data_sources):
        if d["id"] == source_id:
            updated = form.model_dump()
            updated["id"] = source_id
            updated["status"] = d["status"]
            updated["lastUpdateTime"] = format_now()
            mock_data_sources[i] = updated
            return success_response(updated)
    return success_response(None)


@router.delete("/{source_id}")
def delete_data_source(source_id: int):
    global mock_data_sources
    mock_data_sources = [d for d in mock_data_sources if d["id"] != source_id]
    return success_response(None)


@router.post("/{source_id}/test")
def test_data_source_connection(source_id: int):
    item = next((d for d in mock_data_sources if d["id"] == source_id), None)
    if item and item["status"] != "error":
        return success_response({"success": True, "message": "连接成功，响应时间 23ms"})
    return success_response({"success": False, "message": "连接失败：设备无响应"})


@router.post("/{source_id}/toggle")
def toggle_data_source_status(source_id: int, status: str = "online"):
    for d in mock_data_sources:
        if d["id"] == source_id:
            d["status"] = status
            return success_response(None)
    return success_response(None)