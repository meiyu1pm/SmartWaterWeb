# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.modules.health.router import router as health_router
from app.modules.auth.router import router as auth_router
from app.modules.leakage.router import router as leakage_router
from app.modules.data_source.router import router as data_source_router
from app.modules.data_quality.router import router as data_quality_router
from app.modules.waterlogging.router import router as waterlogging_router
from app.modules.algorithm.router import router as algorithm_router
from app.modules.task.router import router as task_router
from app.modules.alarm.router import router as alarm_router


def create_app() -> FastAPI:
    app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health_router, tags=["健康检查"])
    app.include_router(auth_router, prefix=f"{settings.API_V1_STR}/auth", tags=["认证"])
    app.include_router(leakage_router, prefix=f"{settings.API_V1_STR}/leakage", tags=["漏损控制"])
    app.include_router(data_source_router, prefix=f"{settings.API_V1_STR}/data-sources", tags=["数据源管理"])
    app.include_router(data_quality_router, prefix=f"{settings.API_V1_STR}/data-quality", tags=["数据质量"])
    app.include_router(waterlogging_router, prefix=f"{settings.API_V1_STR}/waterlogging", tags=["水位日志"])
    app.include_router(waterlogging_router, prefix=f"{settings.API_V1_STR}/waterlogging", tags=["城市内涝"])
    app.include_router(algorithm_router, prefix=f"{settings.API_V1_STR}/algorithms", tags=["算法管理"])
    app.include_router(task_router, prefix=f"{settings.API_V1_STR}/tasks", tags=["任务中心"])
    app.include_router(alarm_router, prefix=f"{settings.API_V1_STR}/alarms", tags=["告警处置"])

    @app.get("/")
    def root():
        return {"message": "Smart Water Algorithm Platform API", "version": settings.VERSION}
    return app


app = create_app()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )