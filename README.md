# ZSmartWaterWeb 智慧水务算法平台
## 项目简介
本项目是基于 **Angular 21 + FastAPI** 构建的智慧水务算法可视化平台，包含运营数据概览、漏损控制分析两大核心模块，实现水务指标可视化、分区风险评估、异常点检测与时序趋势分析等功能。

---

## 环境准备
启动项目前，请确保本地已安装以下基础环境：
| 环境 | 版本要求 | 验证命令 |
| :--- | :--- | :--- |
| Node.js | 18.0 及以上 | `node -v` |
| npm | 随 Node.js 自带 | `npm -v` |
| Python | 3.11 及以上 | `python --version` |
| Anaconda / Miniconda | 任意版本 | `conda --version` |

---

## 快速启动（分步执行）
项目分为**前端工程**和**后端工程**两部分，需要分别启动。请按顺序执行以下步骤。

### 第一步：启动后端服务（FastAPI）
1.  打开终端（推荐 Git Bash / CMD），进入后端目录
    ```bash
    cd backend
    ```

2.  创建并激活 Python 虚拟环境
    - 首次启动执行（创建环境，仅需执行一次）：
      ```bash
      conda create -n be_env python=3.11 -y
      ```
    - 激活虚拟环境：
      - CMD / PowerShell：
        ```bash
        activate be_env
        ```
      - Git Bash：
        ```bash
        source activate be_env
        ```

3.  安装后端依赖（首次启动执行）
    ```bash
    pip install fastapi uvicorn pydantic
    ```

4.  启动后端服务
    ```bash
    python main.py
    ```

5.  **启动成功标志**：终端显示如下日志
    ```
    INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
    INFO:     Application startup complete.
    ```
    启动后请保持该终端窗口开启，不要关闭。

---

### 第二步：启动前端服务（Angular）
**新开一个终端窗口**，不要关闭后端的终端。

1.  进入前端项目目录
    ```bash
    cd frontend
    ```

2.  安装前端依赖（首次启动执行）
    ```bash
    npm install
    ```

3.  启动前端开发服务
    ```bash
    npm start
    ```

4.  **启动成功标志**：终端显示 `Compiled successfully`，默认占用 4200 端口。

---

## 访问地址
启动完成后，在浏览器中打开以下地址即可查看效果：
- **前端页面地址**：`http://localhost:4200`
  - 左侧菜单可切换「首页概览」「漏损控制」页面
- **后端接口文档地址**：`http://localhost:8000/docs`
  - FastAPI 自动生成的 Swagger 在线文档，可直接调试接口

---

## 当前功能进度
| 页面模块 | 功能点 | 数据状态 |
| :--- | :--- | :--- |
| 首页 Dashboard | 全局概览 KPI 指标卡、全网 24 小时流量趋势、最新告警动态列表 | Mock 模拟数据 |
| 漏损控制页面 | 顶部 KPI 指标卡、分区风险概览、流量/压力历史趋势图 | 已对接真实后端接口 |
| 漏损控制页面 | 漏损异常点表格、夜间最小流量趋势图 | 已对接真实后端接口 |

---

## 项目目录结构
```
ZSmartWaterWeb/
├── backend/                 # 后端 FastAPI 工程
│   └── main.py             # 服务入口，包含所有业务接口与统一响应封装
├── frontend/                # 前端 Angular 工程
│   ├── src/
│   │   ├── app/
│   │   │   ├── features/   # 业务页面模块
│   │   │   │   ├── dashboard/  # 首页概览模块
│   │   │   │   └── leakage/    # 漏损控制模块
│   │   │   └── shared/     # 通用能力层
│   │   │       ├── charts/     # 通用图表组件
│   │   │       └── models/     # 通用类型定义
│   │   └── environments/   # 环境配置（接口地址等）
│   └── package.json
└── README.md
```

---

## 常见问题排查
### 1. Git Bash 中 `conda activate` 报错
- 解决方案：改用 `source activate be_env` 激活环境；或执行 `conda init bash` 后重启终端。

### 2. 端口被占用
- 后端 8000 端口占用：修改 `backend/main.py` 中的 `port` 参数，或关闭占用端口的进程。
- 前端 4200 端口占用：启动时指定其他端口：
  ```bash
  npm start -- --port 4300
  ```

### 3. 页面图表不显示
1.  确认后端服务是否正常运行
2.  按 F12 打开开发者工具，切换到「Network」面板，查看接口请求是否返回 200
3.  切换到「Console」面板，查看是否有 JS 报错

### 4. npm install 安装速度慢
切换为国内镜像源后重试：
```bash
npm config set registry https://registry.npmmirror.com
```