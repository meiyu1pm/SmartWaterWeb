import uuid # 用于生成唯一ID
from datetime import datetime
from typing import Any
from pydantic import BaseModel # 用于定义响应模型


class ApiResponse(BaseModel):
    code: int = 0
    message: str = "success"
    data: Any = None # 用于存储响应数据
    trace_id: str = ""


def success_response(data: Any = None) -> ApiResponse:
    """generate trace_id when success"""
    return ApiResponse(
        code=0,
        message="success",
        data=data,
        trace_id=str(uuid.uuid4())
    )

def format_now() -> str:
    """format current datetime to YYYY-MM-DD HH:MM:SS format"""
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")
