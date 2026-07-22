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
    # Mock登录：任意用户名密码都可以登录，默认返回管理员
    if req.username and req.password:
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
    raise HTTPException(status_code=401, detail="Invalid username or password")

@router.post("/refresh") # 刷新token
def refresh_token(refresh_token: str):
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

@router.post("/logout") # 退出登录
def logout(refresh_token: str):
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