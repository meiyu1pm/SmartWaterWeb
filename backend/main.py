import uuid
import random
import math
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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True  
    )
