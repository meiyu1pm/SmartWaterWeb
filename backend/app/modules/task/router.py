# backend/app/modules/task/router.py
import uuid
import random
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from app.core.response import success_response

router = APIRouter()


# ============ 数据模型 ============
class TaskInfo(BaseModel):
    task_id: str
    task_type: str  # ingestion/algorithm
    status: str  # pending/queued/running/success/failed/cancelled
    progress: int
    trace_id: str
    dataset_version_id: int | None = None
    error_code: str | None = None
    error_message: str | None = None
    created_at: str
    started_at: str | None = None
    finished_at: str | None = None


class TaskLog(BaseModel):
    event_type: str
    message: str
    details: Dict[str, Any] = {}
    created_at: str


class IngestionRequest(BaseModel):
    source_code: str
    limit: int = 10000


# ============ Mock数据 ============
mock_tasks: Dict[str, TaskInfo] = {}
mock_task_logs: Dict[str, List[TaskLog]] = {}


def generate_mock_task(task_type: str) -> TaskInfo:
    """生成模拟任务"""
    task_id = str(uuid.uuid4())
    now = datetime.now()
    task = TaskInfo(
        task_id=task_id,
        task_type=task_type,
        status="queued",
        progress=0,
        trace_id=str(uuid.uuid4()),
        created_at=now.strftime("%Y-%m-%d %H:%M:%S"),
    )
    mock_tasks[task_id] = task
    
    # 生成模拟日志
    logs = []
    logs.append(TaskLog(
        event_type="queued",
        message="任务已创建，等待调度",
        created_at=now.strftime("%Y-%m-%d %H:%M:%S")
    ))
    mock_task_logs[task_id] = logs
    
    return task


# ============ 导入任务接口 ============
@router.post("/ingestions")
def create_ingestion(req: IngestionRequest):
    """创建数据导入任务"""
    task = generate_mock_task("ingestion")
    return success_response({
        "task_id": task.task_id,
        "batch_code": str(uuid.uuid4())
    })


# ============ 任务中心接口 ============
@router.get("/tasks/{task_id}")
def get_task(task_id: str):
    """获取任务详情"""
    task = mock_tasks.get(task_id)
    if not task:
        # 如果不存在，模拟一个运行中的任务
        task = generate_mock_task("algorithm")
        task.status = "running"
        task.progress = random.randint(30, 70)
        task.started_at = (datetime.now() - timedelta(minutes=1)).strftime("%Y-%m-%d %H:%M:%S")
    
    # 模拟进度更新
    if task.status in ["queued", "running"]:
        if random.random() > 0.3:
            task.progress = min(100, task.progress + random.randint(5, 15))
            if task.progress >= 100:
                task.status = "success"
                task.finished_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                mock_task_logs[task_id].append(TaskLog(
                    event_type="success",
                    message="任务执行成功",
                    created_at=task.finished_at
                ))
            elif task.progress > 0 and not task.started_at:
                task.status = "running"
                task.started_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                mock_task_logs[task_id].append(TaskLog(
                    event_type="running",
                    message="任务开始执行",
                    created_at=task.started_at
                ))
    
    return success_response(task.model_dump())


@router.get("/tasks/{task_id}/logs")
def get_task_logs(task_id: str):
    """获取任务日志"""
    logs = mock_task_logs.get(task_id, [])
    if not logs:
        # 模拟默认日志
        now = datetime.now()
        logs = [
            TaskLog(event_type="queued", message="任务已创建", created_at=(now - timedelta(minutes=2)).strftime("%Y-%m-%d %H:%M:%S")),
            TaskLog(event_type="running", message="开始加载数据", created_at=(now - timedelta(minutes=1)).strftime("%Y-%m-%d %H:%M:%S")),
            TaskLog(event_type="running", message="数据预处理中", created_at=now.strftime("%Y-%m-%d %H:%M:%S")),
        ]
    return success_response([l.model_dump() for l in logs])


@router.post("/tasks/{task_id}/cancel")
def cancel_task(task_id: str):
    """取消任务"""
    task = mock_tasks.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.status in ["success", "failed", "cancelled"]:
        raise HTTPException(status_code=409, detail="Task already finished")
    
    task.status = "cancelled"
    task.finished_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    mock_task_logs[task_id].append(TaskLog(
        event_type="cancelled",
        message="任务已被用户取消",
        created_at=task.finished_at
    ))
    return success_response(task.model_dump())