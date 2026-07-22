# backend/app/modules/data_quality/router.py
import random
from fastapi import APIRouter
from pydantic import BaseModel
from app.core.response import success_response

router = APIRouter()


# ============ 数据模型 ============
class QualityKpiItem(BaseModel):
    title: str
    value: str
    unit: str
    color: str


class QualityResultItem(BaseModel):
    id: int
    pointName: str
    pointCode: str
    metricCode: str
    qualityType: str
    score: float
    level: str
    windowStart: str
    windowEnd: str
    count: int
    detail: str
    detectTime: str


class QualityScoreTrend(BaseModel):
    date: str
    score: float


class QualityDimensionStat(BaseModel):
    qualityType: str
    count: int
    rate: float
    score: float


class HeatmapPoint(BaseModel):
    pointCode: str
    pointName: str
    hours: list[float]


# ============ Mock数据 ============
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


# ============ 接口 ============
@router.get("/kpi")
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


@router.get("/results")
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


@router.get("/score-trend")
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


@router.get("/dimension-stats")
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


@router.get("/heatmap")
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
    random.seed(42)
    data = []
    for code, name in points:
        hours = []
        for h in range(24):
            if h < 6:
                hours.append(round(random.uniform(0.15, 0.45), 2))
            elif h < 8 or h >= 18:
                hours.append(round(random.uniform(0.02, 0.12), 2))
            else:
                hours.append(round(random.uniform(0.0, 0.05), 2))
        data.append(HeatmapPoint(pointCode=code, pointName=name, hours=hours))
    return success_response(data)


@router.post("/tasks")
def create_quality_task():
    return success_response({
        "taskId": f"QD-{random.randint(10000, 99999)}",
        "status": "running",
        "message": "分析任务已创建，预计3分钟后完成"
    })