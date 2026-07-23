import uuid
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List


router = APIRouter()


# 请求/响应模型
class LoginRequest(BaseModel):
    username: str
    password: str


class UserInfo(BaseModel):
    id: int
    username: str
    display_name: str
    status: str = "active"
    roles: List[str]
    permissions: List[str]


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = 1200
    user: UserInfo


# 新增刷新/登出请求模型
class RefreshTokenRequest(BaseModel):
    refresh_token: str


# Mock数据
mock_admin_user = UserInfo(
    id=1,
    username="admin",
    display_name="管理员",
    roles=["admin"],
    permissions=[
        "data_source:read", "data_source:write",
        "ingestion:create", "dataset:read",
        "algorithm:read", "algorithm:run",
        "model:upload", "task:read", "task:cancel",
        "result:read", "user:manage", "role:manage"
    ]
)

@router.post("/login")
def login(req: LoginRequest):
    # 校验账号密码，正确账号：admin / 123456
    if req.username == "admin" and req.password == "123456":
        return {
            "code": 0,
            "message": "success",
            "data": LoginResponse(
                access_token=f"mock-access-token-{uuid.uuid4()}",
                refresh_token=f"mock-refresh-token-{uuid.uuid4()}",
                user=mock_admin_user
            ).model_dump(),
            "trace_id": str(uuid.uuid4())
        }
    # 账号密码错误，返回401，对齐统一错误格式
    raise HTTPException(status_code=401, detail="Invalid username or password")

@router.post("/refresh")
def refresh_token(req: RefreshTokenRequest):
    return {
        "code": 0,
        "message": "success",
        "data": LoginResponse(
            access_token=f"mock-access-token-{uuid.uuid4()}",
            refresh_token=f"mock-refresh-token-{uuid.uuid4()}",
            user=mock_admin_user
        ).model_dump(),
        "trace_id": str(uuid.uuid4())
    }

@router.post("/logout")
def logout(req: RefreshTokenRequest):
    return {
        "code": 0, 
        "message": "success",
        "data": {"logged_out": True},
        "trace_id": str(uuid.uuid4())
    }

@router.get("/me") # 获取当前用户信息
def get_current_user():
    return {
        "code": 0,
        "message": "success",
        "data": mock_admin_user.model_dump(),
        "trace_id": str(uuid.uuid4())
    }