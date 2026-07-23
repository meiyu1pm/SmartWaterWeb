# backend/app/modules/algorithm/router.py
import uuid
import random
from fastapi import APIRouter, UploadFile, File, Form
from pydantic import BaseModel
from typing import List, Dict, Any
from app.core.response import success_response

router = APIRouter()


# ============ 数据模型 ============
class AlgorithmInfo(BaseModel):
    id: int
    code: str
    name: str
    version: str
    task_type: str
    runtime_type: str
    default_params: Dict[str, Any]
    status: str


class ModelInfo(BaseModel):
    id: int
    algorithm_version_id: int
    object_key: str
    sha256: str
    size_bytes: int
    runtime_image: str
    status: str


class AlgorithmRunRequest(BaseModel):
    dataset_version_id: int
    algorithm_code: str
    metric_code: str = "flow"
    horizon: int = 96
    algorithm_params: Dict[str, Any] = {}


# ============ Mock数据 ============
mock_algorithms = [
    AlgorithmInfo(
        id=1, code="qscore_v1", name="数据质量评分", version="0.1.0",
        task_type="data_quality", runtime_type="python_package",
        default_params={"expected_interval_seconds": 900},
        status="published"
    ),
    AlgorithmInfo(
        id=2, code="seasonal_naive", name="季节性朴素预测", version="0.1.0",
        task_type="forecast", runtime_type="python_package",
        default_params={"season_length": 96},
        status="published"
    ),
    AlgorithmInfo(
        id=3, code="hampel", name="Hampel异常检测", version="0.1.0",
        task_type="anomaly_detection", runtime_type="python_package",
        default_params={"window_size": 15, "n_sigma": 3},
        status="published"
    ),
    AlgorithmInfo(
        id=4, code="leakage_detect_v1", name="漏损检测模型", version="0.1.0",
        task_type="leakage_detection", runtime_type="python_package",
        default_params={"night_flow_threshold": 8.5, "min_anomaly_score": 70},
        status="published"
    ),
    AlgorithmInfo(
        id=5, code="waterlogging_predict_v1", name="内涝预测模型", version="0.1.0",
        task_type="waterlogging_forecast", runtime_type="python_package",
        default_params={"rain_threshold": 20, "predict_hours": 3},
        status="published"
    ),
]

next_model_id = 1


# ============ 接口 ============
@router.get("")
def get_algorithms():
    """获取已发布算法列表"""
    return success_response([a.model_dump() for a in mock_algorithms])


@router.post("/{algorithm_version_id}/models")
async def upload_model(
    algorithm_version_id: int,
    model_file: UploadFile = File(...),
    runtime_image: str = Form(None)
):
    """上传模型文件"""
    global next_model_id
    file_size = 0
    content = await model_file.read()
    file_size = len(content)
    
    model = ModelInfo(
        id=next_model_id,
        algorithm_version_id=algorithm_version_id,
        object_key=f"models/test/{uuid.uuid4()}/{model_file.filename}",
        sha256=f"mock-sha256-{uuid.uuid4().hex[:32]}",
        size_bytes=file_size,
        runtime_image=runtime_image or "default-python-env",
        status="ready"
    )
    next_model_id += 1
    return success_response(model.model_dump())


@router.post("/runs")
def run_algorithm(req: AlgorithmRunRequest):
    """创建算法运行任务"""
    algo = next((a for a in mock_algorithms if a.code == req.algorithm_code), None)
    if not algo:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Algorithm not found")
    
    return success_response({
        "task_id": str(uuid.uuid4()),
        "algorithm": algo.model_dump()
    })