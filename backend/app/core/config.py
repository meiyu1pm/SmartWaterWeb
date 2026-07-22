# backend/app/core/config.py



class Settings:
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Smart-Water-Algorithm-Backend-API"
    VERSION: str = "1.0.0"
    
    # CORS配置
    BACKEND_CORS_ORIGINS: list[str] = ["*"]
    
    # JWT配置（Mock用）
    SECRET_KEY: str = "smart-water-secret-key-2026"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 20


settings = Settings()