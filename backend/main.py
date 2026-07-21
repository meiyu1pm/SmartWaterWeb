import uuid
import random
import math
from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Any


app = FastAPI(title="Smart-Water-Algorithm-Backend-API", version="1.0.0")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ApiResponse(BaseModel):
    code: int = 0
    message: str = "success"
    data: Any = None
    trace_id: str = ""

def success_response(data: Any) -> ApiResponse:
    """generate trace_id when responding succeed"""
    return ApiResponse(
        code=0,
        message="success",
        data=data,
        trace_id=str(uuid.uuid4())
    )

def format_now() -> str:
    """格式化当前时间为 YYYY-MM-DD HH:MM:SS"""
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

class KpiItem(BaseModel):
    title: str
    value: str
    unit: str
    color: str

class AreaRiskItem(BaseModel):
    name: str
    level: str   # high / medium / low
    leakRate: str

class FlowDataItem(BaseModel):
    time: str
    value: float

class AnomalyItem(BaseModel):
    time: str
    point: str
    score: float
    type: str


@app.get("/api/v1/leakage/kpi", response_model=ApiResponse)
def get_leakage_kpi(areaId: str = "all"):
    kpi_data = [
        KpiItem(title="总供水量", value="1256.8", unit="m³", color="#1677ff"),
        KpiItem(title="总用水量", value="1124.3", unit="m³", color="#52c41a"),
        KpiItem(title="漏损率", value="10.54", unit="%", color="#faad14"),
        KpiItem(title="高风险分区", value="3", unit="个", color="#f5222d"),
        KpiItem(title="未处置告警", value="7", unit="条", color="#fa8c16"),
        KpiItem(title="模型评分", value="92.6", unit="分", color="#722ed1"),
    ]
    return success_response(kpi_data)


@app.get("/api/v1/leakage/area-risk", response_model=ApiResponse)
def get_area_risk():
    data = [
        AreaRiskItem(name="经开6分区", level="high", leakRate="15.2%"),
        AreaRiskItem(name="纬二路片区", level="medium", leakRate="11.8%"),
        AreaRiskItem(name="钻石花园DMA", level="medium", leakRate="10.3%"),
        AreaRiskItem(name="朗诗东山樾", level="low", leakRate="7.6%"),
        AreaRiskItem(name="三级管网9区", level="low", leakRate="6.9%"),
    ]
    return success_response(data)


@app.get("/api/v1/leakage/flow-trend", response_model=ApiResponse)
def get_flow_trend():
    data = [
        FlowDataItem(
            time=f"{str(i).zfill(2)}:00",
            value=round(80 + random.random() * 30 + math.sin(i / 3) * 10, 2)
        )
        for i in range(24)
    ]
    return success_response(data)


@app.get("/api/v1/leakage/anomalies", response_model=ApiResponse)
def get_anomaly_list():
    data = [
        AnomalyItem(time="2026-07-18 02:15", point="FT-007 流量计", score=87.2, type="流量突变"),
        AnomalyItem(time="2026-07-18 01:30", point="PT-012 压力计", score=76.5, type="压力骤降"),
        AnomalyItem(time="2026-07-17 23:45", point="FT-003 总表", score=68.1, type="夜间流量异常"),
        AnomalyItem(time="2026-07-17 22:00", point="PT-005 节点", score=59.3, type="波动异常"),
    ]
    return success_response(data)


@app.get("/api/v1/leakage/night-flow", response_model=ApiResponse)
def get_night_flow():
    data = [
        FlowDataItem(time="07-12", value=6.8),
        FlowDataItem(time="07-13", value=7.2),
        FlowDataItem(time="07-14", value=7.5),
        FlowDataItem(time="07-15", value=8.1),
        FlowDataItem(time="07-16", value=8.6),
        FlowDataItem(time="07-17", value=9.2),
        FlowDataItem(time="07-18", value=9.7),
    ]
    return success_response(data)


# ==================== 数据源管理 ====================

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
    """数据源新增/编辑表单数据（不含 id/status/lastUpdateTime，由后端补全）"""
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

# 内存Mock数据
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


@app.get("/api/v1/data-sources/kpi", response_model=ApiResponse)
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


@app.get("/api/v1/data-sources", response_model=ApiResponse)
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


@app.post("/api/v1/data-sources", response_model=ApiResponse)
def create_data_source(form: DataSourceFormValue):
    global next_ds_id
    new_item = form.model_dump()
    new_item["id"] = next_ds_id
    new_item["status"] = "offline"
    new_item["lastUpdateTime"] = format_now()
    next_ds_id += 1
    mock_data_sources.insert(0, new_item)
    return success_response(new_item)


@app.put("/api/v1/data-sources/{source_id}", response_model=ApiResponse)
def update_data_source(source_id: int, form: DataSourceFormValue):
    for i, d in enumerate(mock_data_sources):
        if d["id"] == source_id:
            updated = form.model_dump()
            updated["id"] = source_id
            updated["status"] = d["status"]          # 保留原状态
            updated["lastUpdateTime"] = format_now()  # 更新时间
            mock_data_sources[i] = updated
            return success_response(updated)
    return success_response(None)


@app.delete("/api/v1/data-sources/{source_id}", response_model=ApiResponse)
def delete_data_source(source_id: int):
    global mock_data_sources
    mock_data_sources = [d for d in mock_data_sources if d["id"] != source_id]
    return success_response(None)


@app.post("/api/v1/data-sources/{source_id}/test", response_model=ApiResponse)
def test_data_source_connection(source_id: int):
    item = next((d for d in mock_data_sources if d["id"] == source_id), None)
    if item and item["status"] != "error":
        return success_response({"success": True, "message": "连接成功，响应时间 23ms"})
    return success_response({"success": False, "message": "连接失败：设备无响应"})


@app.post("/api/v1/data-sources/{source_id}/toggle", response_model=ApiResponse)
def toggle_data_source_status(source_id: int, status: str = "online"):
    for d in mock_data_sources:
        if d["id"] == source_id:
            d["status"] = status
            return success_response(None)
    return success_response(None)


# ==================== 数据质量分析 ====================

class QualityKpiItem(BaseModel):
    title: str
    value: str
    unit: str
    color: str

class QualityResultItem(BaseModel):
    id: int
    pointName: str
    pointCode: str
    metricCode: str        # flow / pressure / volume / quality
    qualityType: str       # missing / duplicate / outlier / freeze / drift / negative_flow / pressure_oor / jump
    score: float           # 0-100
    level: str             # excellent / good / warning / poor
    windowStart: str
    windowEnd: str
    count: int             # 异常数据条数
    detail: str
    detectTime: str

class QualityScoreTrend(BaseModel):
    date: str
    score: float

class QualityDimensionStat(BaseModel):
    qualityType: str
    count: int
    rate: float            # 占比 %
    score: float

class HeatmapPoint(BaseModel):
    pointCode: str
    pointName: str
    hours: list[float]     # 24个小时的缺失率 0-1

# 内存Mock数据 —— 质量检测结果
mock_quality_results: list[dict] = [
    {"id": 1, "pointName": "经开6分区流量计", "pointCode": "FT-001", "metricCode": "flow", "qualityType": "missing", "score": 72.5, "level": "warning", "windowStart": "2026-07-20 00:00:00", "windowEnd": "2026-07-20 06:00:00", "count": 142, "detail": "凌晨时段连续缺失142条数据", "detectTime": "2026-07-20 06:15:00"},
    {"id": 2, "pointName": "纬二路压力监测点", "pointCode": "PT-002", "metricCode": "pressure", "qualityType": "freeze", "score": 58.3, "level": "poor", "windowStart": "2026-07-19 12:00:00", "windowEnd": "2026-07-20 12:00:00", "count": 2880, "detail": "压力值持续24小时恒定0.32MPa，疑似冻结", "detectTime": "2026-07-20 12:30:00"},
    {"id": 3, "pointName": "钻石花园DMA流量计", "pointCode": "FT-004", "metricCode": "flow", "qualityType": "outlier", "score": 81.2, "level": "good", "windowStart": "2026-07-19 00:00:00", "windowEnd": "2026-07-20 00:00:00", "count": 23, "detail": "检出23个离群点，最大值超出3σ", "detectTime": "2026-07-20 00:05:00"},
    {"id": 4, "pointName": "朗诗东山樾流量计", "pointCode": "FT-006", "metricCode": "flow", "qualityType": "negative_flow", "score": 45.6, "level": "poor", "windowStart": "2026-07-19 18:00:00", "windowEnd": "2026-07-20 06:00:00", "count": 67, "detail": "夜间出现67条负流量记录，疑似设备反向", "detectTime": "2026-07-20 06:10:00"},
    {"id": 5, "pointName": "总表FT-003流量计", "pointCode": "FT-003", "metricCode": "flow", "qualityType": "drift", "score": 76.8, "level": "warning", "windowStart": "2026-07-14 00:00:00", "windowEnd": "2026-07-20 00:00:00", "count": 0, "detail": "7天内基线漂移4.2%，超阈值3%", "detectTime": "2026-07-20 00:15:00"},
    {"id": 6, "pointName": "三级管网9区压力计", "pointCode": "PT-009", "metricCode": "pressure", "qualityType": "pressure_oor", "score": 63.1, "level": "warning", "windowStart": "2026-07-19 00:00:00", "windowEnd": "2026-07-20 00:00:00", "count": 15, "detail": "15条压力值超出0.1-0.6MPa范围", "detectTime": "2026-07-20 00:20:00"},
    {"id": 7, "pointName": "纬二路片区流量计B", "pointCode": "FT-012", "metricCode": "flow", "qualityType": "jump", "score": 69.4, "level": "warning", "windowStart": "2026-07-19 14:00:00", "windowEnd": "2026-07-19 18:00:00", "count": 8, "detail": "4小时内出现8次跳变，最大幅度达300%", "detectTime": "2026-07-19 18:05:00"},
    {"id": 8, "pointName": "远传水表数据库", "pointCode": "DB-003", "metricCode": "volume", "qualityType": "duplicate", "score": 88.7, "level": "good", "windowStart": "2026-07-19 00:00:00", "windowEnd": "2026-07-20 00:00:00", "count": 12, "detail": "12条重复抄表记录，相同时间戳", "detectTime": "2026-07-20 00:30:00"},
    {"id": 9, "pointName": "经开6分区流量计", "pointCode": "FT-001", "metricCode": "flow", "qualityType": "outlier", "score": 84.3, "level": "good", "windowStart": "2026-07-19 08:00:00", "windowEnd": "2026-07-19 16:00:00", "count": 5, "detail": "日间检出5个离群点", "detectTime": "2026-07-19 16:10:00"},
    {"id": 10, "pointName": "水质监测点WQ-01", "pointCode": "WQ-011", "metricCode": "quality", "qualityType": "missing", "score": 79.6, "level": "warning", "windowStart": "2026-07-19 00:00:00", "windowEnd": "2026-07-20 00:00:00", "count": 36, "detail": "浊度数据缺失36条", "detectTime": "2026-07-20 00:35:00"},
    {"id": 11, "pointName": "泵站出口压力计", "pointCode": "PT-007", "metricCode": "pressure", "qualityType": "freeze", "score": 91.5, "level": "excellent", "windowStart": "2026-07-19 00:00:00", "windowEnd": "2026-07-20 00:00:00", "count": 2, "detail": "仅2条疑似冻结，影响极小", "detectTime": "2026-07-20 00:40:00"},
    {"id": 12, "pointName": "钻石花园DMA压力计", "pointCode": "PT-015", "metricCode": "pressure", "qualityType": "missing", "score": 55.2, "level": "poor", "windowStart": "2026-07-19 20:00:00", "windowEnd": "2026-07-20 08:00:00", "count": 960, "detail": "离线期间数据全部缺失", "detectTime": "2026-07-20 08:15:00"},
    {"id": 13, "pointName": "总表FT-003流量计", "pointCode": "FT-003", "metricCode": "flow", "qualityType": "jump", "score": 82.1, "level": "good", "windowStart": "2026-07-19 06:00:00", "windowEnd": "2026-07-19 10:00:00", "count": 3, "detail": "早高峰时段3次跳变", "detectTime": "2026-07-19 10:05:00"},
    {"id": 14, "pointName": "SCADA系统数据接口", "pointCode": "API-014", "metricCode": "flow", "qualityType": "drift", "score": 90.8, "level": "excellent", "windowStart": "2026-07-14 00:00:00", "windowEnd": "2026-07-20 00:00:00", "count": 0, "detail": "7天漂移1.1%，在阈值内", "detectTime": "2026-07-20 00:45:00"},
    {"id": 15, "pointName": "朗诗东山樾流量计", "pointCode": "FT-006", "metricCode": "flow", "qualityType": "duplicate", "score": 85.9, "level": "good", "windowStart": "2026-07-19 00:00:00", "windowEnd": "2026-07-20 00:00:00", "count": 7, "detail": "7条重复记录", "detectTime": "2026-07-20 00:50:00"},
]


@app.get("/api/v1/data-quality/kpi", response_model=ApiResponse)
def get_quality_kpi():
    total_points = 12
    avg_score = round(sum(r["score"] for r in mock_quality_results) / len(mock_quality_results), 1)
    abnormal_count = sum(r["count"] for r in mock_quality_results)
    avg_missing_rate = round(sum(r["count"] for r in mock_quality_results if r["qualityType"] == "missing") / (total_points * 5760) * 100, 2)
    data = [
        QualityKpiItem(title="整体质量评分", value=str(avg_score), unit="分", color="#1677ff"),
        QualityKpiItem(title="检测点位数", value=str(total_points), unit="个", color="#52c41a"),
        QualityKpiItem(title="异常数据条数", value=str(abnormal_count), unit="条", color="#f5222d"),
        QualityKpiItem(title="平均缺失率", value=str(avg_missing_rate), unit="%", color="#faad14"),
    ]
    return success_response(data)


@app.get("/api/v1/data-quality/results", response_model=ApiResponse)
def get_quality_results(
    keyword: str = "",
    qualityType: str = "",
    level: str = "",
    pageIndex: int = 1,
    pageSize: int = 10
):
    filtered = list(mock_quality_results)
    if keyword:
        kw = keyword.lower()
        filtered = [r for r in filtered if kw in r["pointCode"].lower() or kw in r["pointName"].lower()]
    if qualityType:
        filtered = [r for r in filtered if r["qualityType"] == qualityType]
    if level:
        filtered = [r for r in filtered if r["level"] == level]

    start = (pageIndex - 1) * pageSize
    end = start + pageSize
    page_list = filtered[start:end]
    return success_response({"list": page_list, "total": len(filtered)})


@app.get("/api/v1/data-quality/score-trend", response_model=ApiResponse)
def get_quality_score_trend():
    data = [
        QualityScoreTrend(date="07-14", score=88.2),
        QualityScoreTrend(date="07-15", score=86.5),
        QualityScoreTrend(date="07-16", score=84.1),
        QualityScoreTrend(date="07-17", score=82.8),
        QualityScoreTrend(date="07-18", score=80.3),
        QualityScoreTrend(date="07-19", score=78.6),
        QualityScoreTrend(date="07-20", score=76.2),
    ]
    return success_response(data)


@app.get("/api/v1/data-quality/dimension-stats", response_model=ApiResponse)
def get_quality_dimension_stats():
    type_counts = {}
    for r in mock_quality_results:
        t = r["qualityType"]
        if t not in type_counts:
            type_counts[t] = {"count": 0, "score_sum": 0, "score_n": 0}
        type_counts[t]["count"] += r["count"]
        type_counts[t]["score_sum"] += r["score"]
        type_counts[t]["score_n"] += 1

    total = sum(v["count"] for v in type_counts.values()) or 1
    data = []
    for t, v in type_counts.items():
        data.append(QualityDimensionStat(
            qualityType=t,
            count=v["count"],
            rate=round(v["count"] / total * 100, 1),
            score=round(v["score_sum"] / v["score_n"], 1)
        ))
    return success_response(data)


@app.get("/api/v1/data-quality/heatmap", response_model=ApiResponse)
def get_quality_heatmap():
    points = [
        ("FT-001", "经开6分区流量计"),
        ("PT-002", "纬二路压力监测点"),
        ("FT-004", "钻石花园DMA流量计"),
        ("FT-006", "朗诗东山樾流量计"),
        ("FT-003", "总表FT-003流量计"),
        ("PT-009", "三级管网9区压力计"),
        ("FT-012", "纬二路片区流量计B"),
        ("PT-015", "钻石花园DMA压力计"),
    ]
    # 为每个点位生成24小时缺失率 (0-1)
    random.seed(42)
    data = []
    for code, name in points:
        hours = []
        for h in range(24):
            if h < 6:
                hours.append(round(random.uniform(0.15, 0.45), 2))   # 凌晨缺失多
            elif h < 8 or h >= 18:
                hours.append(round(random.uniform(0.02, 0.12), 2))   # 高峰较少
            else:
                hours.append(round(random.uniform(0.0, 0.05), 2))    # 日间最少
        data.append(HeatmapPoint(pointCode=code, pointName=name, hours=hours))
    return success_response(data)


@app.post("/api/v1/data-quality/tasks", response_model=ApiResponse)
def create_quality_task():
    # 模拟创建分析任务
    return success_response({
        "taskId": f"QD-{random.randint(10000, 99999)}",
        "status": "running",
        "message": "分析任务已创建，预计3分钟后完成"
    })


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True  
    )
