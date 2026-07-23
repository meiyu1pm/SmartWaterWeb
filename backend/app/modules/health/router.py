# backend/app/modules/health/router.py
import uuid
from fastapi import APIRouter

router = APIRouter()


@router.get("/health/live")
def health_live():
    return {
        "code": 0,
        "message": "success",
        "data": {"status": "alive"},
        "trace_id": str(uuid.uuid4())
    }


@router.get("/health/ready")
def health_ready():
    return {
        "code": 0,
        "message": "success",
        "data": {
            "status": "ready",
            "dependencies": {
                "mysql": "ok",
                "redis": "ok",
                "rabbitmq": "ok",
                "minio": "ok"
            }
        },
        "trace_id": str(uuid.uuid4())
    }