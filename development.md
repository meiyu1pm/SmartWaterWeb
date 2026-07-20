# 智能水务算法应用平台——详细设计与开发实施手册

## 系统开发总路线

本项目必须按“先平台通用能力，后案例闭环，再预留扩展”的顺序推进。不要一开始就开发所有12个场景，也不要把案例逻辑硬编码到页面里。

| 顺序 | 工作内容 | 负责人 | 建议工期 | 前置依赖 | 交付成果 | 可并行 | 未完成影响 |
|---|---|---|---:|---|---|---|---|
| 1 | 读取需求与梳理12个业务场景 | 产品/需求负责人、水务业务顾问 | 2天 | PDF与访谈材料 | 12场景清单、第一阶段范围 | 否 | 后续数据库、菜单、场景配置无法确定 |
| 2 | 扫描数据目录并建立数据清单 | 数据工程师 | 2天 | 原始数据只读访问 | directory_inventory.csv、excel_sheet_inventory.csv | 可与1部分并行 | 不知道有哪些数据可用 |
| 3 | 建立字段业务字典 | 数据工程师、水务业务顾问 | 3天 | 数据扫描结果 | field_business_dictionary.csv | 可与4并行 | 字段映射、算法输入无法确定 |
| 4 | 完成数据质量分析 | 数据工程师、算法工程师 | 3天 | 数据扫描脚本 | data_quality_report.md、缺失/异常/采样报告 | 是 | 算法训练数据不可信 |
| 5 | 确定系统技术架构 | 架构师 | 2天 | 需求和数据摸底 | 技术架构、部署架构、组件选型 | 否 | 后端、前端、数据库方向不统一 |
| 6 | 设计数据库ER关系 | 架构师、后端、数据工程师 | 3天 | 技术架构、字段字典 | ER图、表设计说明 | 否 | ORM和接口无法稳定开发 |
| 7 | 创建数据库和基础表 | 学生A：数据库与ORM | 3天 | ER设计 | Alembic迁移、基础表 | 可与8准备并行 | 数据接入和后端无法落库 |
| 8 | 搭建Python后端工程 | 学生D/后端组 | 2天 | 技术架构 | FastAPI工程、Swagger、统一返回 | 可与9并行 | 所有API开发延迟 |
| 9 | 搭建Angular前端工程 | 学生F/前端组 | 2天 | 技术架构 | Angular工程、路由、登录框架 | 可与8并行 | 页面开发延迟 |
| 10 | 实现数据源管理 | 学生B、后端、前端 | 3天 | 数据库、后端、前端框架 | data_source CRUD页面和接口 | 是 | 文件导入无配置入口 |
| 11 | 实现文件导入和时序数据入库 | 学生B、学生A | 5天 | 数据源管理、时序表 | 导入任务、ts_measurement写入 | 否 | 后续质量分析、算法无数据 |
| 12 | 实现数据质量分析 | 学生C、学生B | 4天 | 时序数据入库 | 缺失/异常/Qscore结果和页面 | 可与13部分并行 | 算法输入不可信 |
| 13 | 实现算法统一接口 | 学生D、算法工程师 | 3天 | 后端工程、数据集结构 | WaterAlgorithmBase、算法包规范 | 可与12并行 | 算法无法标准接入 |
| 14 | 实现算法注册和版本管理 | 学生D | 4天 | 统一算法接口、算法表 | 算法管理接口和页面 | 是 | 场景编排无法绑定算法 |
| 15 | 实现任务调度和异步执行 | 学生D、运维 | 4天 | Celery/Redis/RabbitMQ | 训练/推理/质量任务执行 | 是 | 大文件和算法任务会阻塞API |
| 16 | 实现场景管理和场景编排 | 学生E、后端、前端 | 5天 | 算法注册、数据源绑定 | 场景配置、节点DAG、运行日志 | 否 | 案例1/2无法配置化运行 |
| 17 | 完成案例1闭环 | 学生G、学生B/C/D/E | 7天 | 数据、算法、场景、前端 | 漏损分析闭环页面和报告 | 否 | 第一阶段核心验收无法通过 |
| 18 | 完成案例2闭环 | 学生H、学生D/E/F | 7天 | 场景编排、样例或真实排水数据 | 内涝预警闭环页面 | 可与17后半并行 | 第二个典型案例无法验收 |
| 19 | 预留其他10个场景 | 学生E、学生F | 2天 | 场景管理 | 菜单、路由、模板页、配置记录 | 可与17/18并行 | 后续扩展入口缺失 |
| 20 | 完成联调、测试和部署 | 学生I、全体 | 5天 | 全部功能初版 | 测试报告、部署包、验收清单 | 否 | 无法交付 |


# 1. 项目目标与范围


### 项目目标与范围

**目标：**
建设一个可实际开发、部署和扩展的智能水务算法应用平台。第一阶段重点完成案例1供水漏损和案例2城市内涝闭环，其余10个场景只做预留。

**前置条件：**
已获得PDF需求、数据目录和第一阶段优先级；已明确Angular前端、Python后端技术路线。

**具体操作：**
1. 确认12个业务场景。
2. 确认第一阶段只做两个完整案例。
3. 明确平台通用能力优先。
4. 明确水务业务不确定内容均标注待业务确认。
5. 明确禁止修改原始数据目录。

**推荐技术：**
需求分析、数据扫描、FastAPI、Angular、PostgreSQL、TimescaleDB、Celery、MinIO。

**参考代码：**
本步骤涉及的SQL、Python、FastAPI、Angular或配置示例见本章下方代码块；如果本步骤不直接写代码，则提交对应的配置、表格、页面设计或验收清单。

**输入：**
PDF需求、数据目录、业务访谈、已有Excel样例。

**输出：**
范围说明、12场景清单、第一阶段MVP目标、待业务确认清单。

**验收方法：**
学生能说明先做什么、不做什么；能解释为什么案例1/2优先；能列出10个预留场景。

**常见问题：**
范围过大；一开始做12个场景全部算法；把业务规则写死；把推测字段当正式规则。

**下一步：**
进入开发前准备和环境搭建。


## 1.1 第一阶段必须完成

1. 数据源管理。
2. 文件导入和时序数据入库。
3. 数据质量分析。
4. 算法统一接口。
5. 算法注册和版本管理。
6. 异步任务执行。
7. 场景管理和场景编排。
8. 案例1供水漏损闭环。
9. 案例2城市内涝闭环。
10. 前端展示、告警处置、模型评估。

## 1.2 第一阶段暂不深做

1. 复杂多租户体系。
2. 完整知识图谱。
3. 全部12个场景深度算法。
4. 大规模Kafka实时流平台。
5. 复杂GPU集群管理。
6. 高级BI报表平台。

这些能力可以在设计中预留，但不要阻塞第一阶段交付。

## 1.3 12个业务场景

| 编码 | 场景名称 | 阶段 |
|---|---|---|
| S01 | 城镇供水管网漏损控制与评定 | 第一阶段完整开发 |
| S02 | 城市内涝预警报警与指挥调度 | 第一阶段完整开发 |
| S03 | 全流程饮用水水质安全保障 | 第二阶段重点开发 |
| S04 | 城镇供水水量调度保障 | 第二阶段重点开发 |
| S05 | 供水全流程节能降耗 | 后续预留 |
| S06 | 供水资产生命周期健康管理 | 后续预留 |
| S07 | 城镇供水智能优服管理 | 后续预留 |
| S08 | 排水系统溢流控制 | 第二阶段重点开发 |
| S09 | 污水系统提质增效 | 后续预留 |
| S10 | 排水资产生命周期健康管理 | 后续预留 |
| S11 | 污水处理厂节能降耗 | 后续预留 |
| S12 | 排水户监管与污染溯源 | 后续预留 |

# 2. 项目开发前准备


### 项目开发前准备

**目标：**
在写代码前统一资料、目录、分工、Git规范和禁止事项，减少学生并行开发冲突。

**前置条件：**
项目目标已确认；学生分工已初步确定。

**具体操作：**
1. 建立代码仓库。
2. 建立backend、frontend、docs、tools目录。
3. 建立Git分支规范。
4. 复制.env.example。
5. 建立analysis-output输出目录。
6. 确认原始数据目录只读。
7. 开发任务按学生拆分。

**推荐技术：**
Git、Markdown、VS Code、任务看板。

**参考代码：**
本步骤涉及的SQL、Python、FastAPI、Angular或配置示例见本章下方代码块；如果本步骤不直接写代码，则提交对应的配置、表格、页面设计或验收清单。

**输入：**
需求文档、数据路径、学生名单、开发电脑环境。

**输出：**
项目仓库、目录结构、任务分工表、开发规范。

**验收方法：**
每个学生能拉取代码并启动基础项目；每个任务有负责人；原始数据目录没有被写入。

**常见问题：**
多人改同一文件；没有.env.example；把输出写回原始目录；提交大文件到Git。

**下一步：**
进入环境搭建。


推荐仓库结构：

```text
smart-water-platform/
├─ backend/
├─ frontend/
├─ docs/
├─ tools/
├─ analysis-output/
├─ deploy/
├─ README.md
└─ .gitignore
```

`.gitignore`至少包含：

```gitignore
.venv/
node_modules/
dist/
__pycache__/
.env
analysis-output/
*.log
*.xlsx
*.zip
```


# 3. 环境搭建


### 环境搭建

**目标：**
让每名学生在本机能启动后端、前端、数据库、Redis、RabbitMQ和MinIO，保证后续开发环境一致。

**前置条件：**
已安装Git；电脑能访问项目代码；磁盘有至少20GB可用空间；Windows用户建议使用PowerShell或Git Bash。

**具体操作：**
1. 安装推荐软件版本。
2. 创建后端虚拟环境并安装依赖。
3. 创建Angular工程。
4. 使用Docker Compose启动中间件。
5. 配置.env和前端environment.ts。
6. 分别验证后端Swagger、前端首页、数据库连接和对象存储控制台。

**推荐技术：**
Python 3.11、Node.js 20 LTS、Angular 18或项目确认版本、PostgreSQL 16、TimescaleDB、Redis 7、RabbitMQ、MinIO、Docker、Git、VS Code、DBeaver/Navicat、Postman/Apifox。

**参考代码：**
本步骤涉及的SQL、Python、FastAPI、Angular或配置示例见本章下方代码块；如果本步骤不直接写代码，则提交对应的配置、表格、页面设计或验收清单。

**输入：**
requirements.txt、package.json、docker-compose.yml、.env、数据库初始化SQL。

**输出：**
可运行的backend、frontend、PostgreSQL/TimescaleDB、Redis、RabbitMQ、MinIO开发环境。

**验收方法：**
访问 http://127.0.0.1:8000/docs 能看到Swagger；访问 http://localhost:4200 能看到Angular首页；DBeaver能连接数据库；MinIO控制台可登录。

**常见问题：**
端口被占用；Python版本不一致；Node版本过低；Docker未启动；.env配置错误。排查时先检查版本，再检查端口，再检查日志。

**下一步：**
进入数据库建库建表和后端工程搭建。


## 3.1 推荐软件版本与作用

| 软件 | 推荐版本 | 作用 |
|---|---|---|
| Python | 3.11 | 后端FastAPI、数据处理、算法运行 |
| Node.js | 20 LTS | Angular前端构建环境 |
| Angular CLI | 18或项目确认版本 | 创建和运行前端工程 |
| PostgreSQL | 16 | 存储业务表、系统表、场景表、结果表 |
| TimescaleDB | 与PostgreSQL 16匹配 | 存储高频时序监测数据 |
| Redis | 7 | 缓存、Celery结果、WebSocket状态 |
| RabbitMQ | 3.x | Celery消息队列，异步任务调度 |
| MinIO | RELEASE新版 | 存放原始导入文件、模型文件、报告附件 |
| Docker | 最新稳定版 | 一键启动开发中间件 |
| Git | 最新稳定版 | 代码版本管理 |
| VS Code | 最新稳定版 | 推荐开发IDE |
| DBeaver/Navicat | 任一 | 数据库查看和调试 |
| Postman/Apifox | 任一 | 接口调试和接口文档协作 |

## 3.2 后端环境搭建步骤

```bash
mkdir smart-water-platform
cd smart-water-platform

mkdir backend
cd backend

python -m venv .venv

# Windows PowerShell
.venv\Scripts\activate

python -m pip install --upgrade pip
pip install fastapi uvicorn sqlalchemy alembic psycopg2-binary \
  pydantic pydantic-settings pandas numpy openpyxl \
  celery redis minio python-jose passlib[bcrypt] \
  python-multipart pytest httpx scikit-learn
```

`requirements.txt`示例：

```text
fastapi==0.115.0
uvicorn[standard]==0.30.6
SQLAlchemy==2.0.35
alembic==1.13.2
psycopg2-binary==2.9.9
pydantic==2.9.2
pydantic-settings==2.5.2
pandas==2.2.3
numpy==2.1.1
openpyxl==3.1.5
celery==5.4.0
redis==5.0.8
minio==7.2.8
python-jose==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.9
pytest==8.3.3
httpx==0.27.2
scikit-learn==1.5.2
```

`.env`示例：

```dotenv
APP_NAME=smart-water-platform
APP_ENV=dev
DEBUG=true

DATABASE_URL=postgresql+psycopg2://smart_water_user:change_me@127.0.0.1:5432/smart_water_dev
REDIS_URL=redis://127.0.0.1:6379/0
CELERY_BROKER_URL=amqp://smart_water:change_me@127.0.0.1:5672//
CELERY_RESULT_BACKEND=redis://127.0.0.1:6379/1

MINIO_ENDPOINT=127.0.0.1:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=smart-water
MINIO_SECURE=false

LOG_DIR=logs
JWT_SECRET_KEY=change_me_in_production
JWT_EXPIRE_MINUTES=1440
```

开发、测试、生产必须使用不同数据库，例如：

```text
smart_water_dev
smart_water_test
smart_water_prod
```

禁止学生直接连接生产库调试。

## 3.3 Angular环境搭建步骤

```bash
npm install -g @angular/cli
ng new smart-water-web --routing --style=scss
cd smart-water-web

npm install echarts ngx-echarts
npm install @angular/material
```

推荐目录：

```text
src/app/
├─ core/
│  ├─ auth/
│  ├─ guards/
│  ├─ interceptors/
│  ├─ layout/
│  └─ services/
├─ shared/
│  ├─ components/
│  ├─ charts/
│  ├─ models/
│  └─ pipes/
├─ features/
│  ├─ dashboard/
│  ├─ data-source/
│  ├─ data-quality/
│  ├─ algorithm/
│  ├─ scenario/
│  ├─ leakage/
│  ├─ waterlogging/
│  └─ system/
└─ app.routes.ts
```

环境配置示例：

```ts
// src/environments/environment.ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://127.0.0.1:8000/api/v1',
  wsBaseUrl: 'ws://127.0.0.1:8000/ws/v1'
};
```

HTTP拦截器示例：

```ts
export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const token = localStorage.getItem('access_token');
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;
  return next(authReq);
}
```

登录守卫示例：

```ts
export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('access_token');
  if (!token) {
    router.navigate(['/login']);
    return false;
  }
  return true;
};
```

## 3.4 Docker开发环境

`docker-compose.yml`示例：

```yaml
version: "3.9"
services:
  postgres:
    image: timescale/timescaledb:latest-pg16
    container_name: smart-water-postgres
    environment:
      POSTGRES_DB: smart_water_dev
      POSTGRES_USER: smart_water_user
      POSTGRES_PASSWORD: change_me
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7
    container_name: smart-water-redis
    ports:
      - "6379:6379"

  rabbitmq:
    image: rabbitmq:3-management
    container_name: smart-water-rabbitmq
    environment:
      RABBITMQ_DEFAULT_USER: smart_water
      RABBITMQ_DEFAULT_PASS: change_me
    ports:
      - "5672:5672"
      - "15672:15672"

  minio:
    image: minio/minio
    container_name: smart-water-minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - miniodata:/data

volumes:
  pgdata:
  miniodata:
```

启动：

```bash
docker compose up -d
docker compose ps
```

端口说明：

| 服务 | 端口 | 用途 |
|---|---:|---|
| PostgreSQL/TimescaleDB | 5432 | 数据库 |
| Redis | 6379 | 缓存和任务结果 |
| RabbitMQ | 5672 | Celery队列 |
| RabbitMQ Management | 15672 | 队列控制台 |
| MinIO API | 9000 | 文件和模型上传 |
| MinIO Console | 9001 | 对象存储控制台 |


# 4. 数据理解与数据扫描


### 数据理解与数据扫描

**目标：**
让学生知道本地目录里有哪些数据、每个文件有哪些字段、哪些字段可能是时间/设备/流量/压力字段，并形成可追溯的数据质量报告。

**前置条件：**
原始数据目录可读；已创建独立输出目录analysis-output；不得修改、删除、移动、重命名原始文件。

**具体操作：**
1. 运行目录扫描脚本。
2. 输出文件清单和Excel工作表清单。
3. 运行字段自动识别。
4. 运行数据质量分析。
5. 生成字段业务字典和待确认问题。
6. 将结果提交给业务人员确认。

**推荐技术：**
Python、pathlib、pandas、openpyxl、json、csv、logging。

**参考代码：**
本步骤涉及的SQL、Python、FastAPI、Angular或配置示例见本章下方代码块；如果本步骤不直接写代码，则提交对应的配置、表格、页面设计或验收清单。

**输入：**
`F:\dataspace\供水-张家口`只读目录；扫描配置；字段识别规则。

**输出：**
directory_inventory.csv、directory_summary.json、excel_sheet_inventory.csv、data_profile.csv、field_business_dictionary.csv、data_quality_report.md。

**验收方法：**
扫描脚本能在不修改原始目录的情况下完成；输出目录包含预期文件；字段字典中不确定字段标记“待业务确认”。

**常见问题：**
中文路径读取失败；Excel文件过大；日期字段误识别；控制台乱码；内存占用过高。优先检查路径编码、分块读取、日志文件。

**下一步：**
进入数据库设计和数据入库。


原始数据目录：

```text
F:\dataspace\供水-张家口
```

输出目录：

```text
analysis-output/
```

只读原则：

1. 原始数据永不覆盖。
2. 原始值必须保留。
3. 清洗值单独保存。
4. 补全值单独保存。
5. 每个处理值记录处理方法。
6. 每次处理记录处理版本。
7. 真实异常不能误删。
8. 技术性错误与业务异常必须区分。

## 4.1 目录扫描脚本

建议建立：

```text
tools/scan_data_directory.py
```

参考代码：

```python
from pathlib import Path
import csv
import json
import logging
from datetime import datetime
from collections import Counter
import openpyxl

SOURCE_DIR = Path(r"F:\dataspace\供水-张家口")
OUTPUT_DIR = Path("analysis-output")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

logging.basicConfig(
    filename=OUTPUT_DIR / "scan.log",
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
    encoding="utf-8",
)

def safe_relative(path: Path) -> str:
    try:
        return str(path.relative_to(SOURCE_DIR))
    except ValueError:
        return str(path)

def inspect_excel(path: Path) -> list[dict]:
    rows = []
    try:
        wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
        for sheet_name in wb.sheetnames:
            ws = wb[sheet_name]
            header = []
            for row in ws.iter_rows(min_row=1, max_row=10, values_only=True):
                values = [str(v).strip() if v is not None else "" for v in row]
                if sum(bool(v) for v in values) >= 2:
                    header = values
                    break
            rows.append({
                "file": safe_relative(path),
                "sheet": sheet_name,
                "max_row": ws.max_row,
                "max_column": ws.max_column,
                "header": "|".join(header),
            })
        wb.close()
    except Exception as exc:
        logging.exception("inspect excel failed: %s", path)
        rows.append({
            "file": safe_relative(path),
            "sheet": "",
            "max_row": 0,
            "max_column": 0,
            "header": "",
            "error": repr(exc),
        })
    return rows

def main():
    inventory = []
    sheet_rows = []
    for path in SOURCE_DIR.rglob("*"):
        if not path.is_file():
            continue
        stat = path.stat()
        inventory.append({
            "relative_path": safe_relative(path),
            "extension": path.suffix.lower(),
            "size_bytes": stat.st_size,
            "modified_at": datetime.fromtimestamp(stat.st_mtime).isoformat(timespec="seconds"),
        })
        if path.suffix.lower() in [".xlsx", ".xlsm"]:
            sheet_rows.extend(inspect_excel(path))

    with open(OUTPUT_DIR / "directory_inventory.csv", "w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["relative_path", "extension", "size_bytes", "modified_at"])
        writer.writeheader()
        writer.writerows(inventory)

    with open(OUTPUT_DIR / "excel_sheet_inventory.csv", "w", encoding="utf-8-sig", newline="") as f:
        fieldnames = ["file", "sheet", "max_row", "max_column", "header", "error"]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for row in sheet_rows:
            writer.writerow(row)

    summary = {
        "source_dir": str(SOURCE_DIR),
        "file_count": len(inventory),
        "extension_counts": Counter(r["extension"] for r in inventory),
        "total_size_bytes": sum(r["size_bytes"] for r in inventory),
    }
    with open(OUTPUT_DIR / "directory_summary.json", "w", encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    main()
```

运行：

```bash
python tools/scan_data_directory.py
```

输出：

```text
analysis-output/
  directory_inventory.csv
  directory_summary.json
  excel_sheet_inventory.csv
  scan.log
```

## 4.2 字段自动识别

字段识别只能作为“推测”，不能直接作为正式规则。

识别规则示例：

| 类型 | 关键词示例 |
|---|---|
| 时间字段 | 时间、日期、time、date、采集时间、更新时间 |
| 设备字段 | 设备、表号、IMEI、device、meter |
| 点位字段 | 点位、监测点、节点、point |
| 压力字段 | 压力、pressure、MPa |
| 流量字段 | 流量、flow、m³/h、m3/h |
| 累计流量字段 | 累计、cumulFlow、累计水量 |
| 水位字段 | 水位、液位、level |
| 水质字段 | pH、浊度、余氯、电导率 |
| 告警字段 | 告警、报警、alarm、warning |
| 地址字段 | 地址、address |
| 分区字段 | 分区、DMA、小区、area |

字段字典表：

| 原始文件 | 工作表 | 原始字段 | 推测含义 | 数据类型 | 单位 | 是否时间字段 | 是否模型输入 | 是否预测目标 | 是否待确认 |
|---|---|---|---|---|---|---|---|---|---|

字段识别代码片段：

```python
def guess_field(field_name: str) -> dict:
    name = field_name.lower()
    result = {
        "meaning": "待业务确认",
        "unit": "待业务确认",
        "is_time": False,
        "is_model_input": "待确认",
        "is_prediction_target": "待确认",
        "need_confirm": True,
    }
    if any(k in name for k in ["time", "date", "时间", "日期"]):
        result.update({"meaning": "采集或业务时间，待业务确认", "is_time": True})
    elif "压力" in field_name or "pressure" in name:
        result.update({"meaning": "压力监测值，待业务确认", "unit": "MPa或kPa，待业务确认"})
    elif "流量" in field_name or "flow" in name:
        result.update({"meaning": "流量或水量字段，待业务确认", "unit": "m3/h或m3，待业务确认"})
    elif "dma" in name or "分区" in field_name or "小区" in field_name:
        result.update({"meaning": "空间或业务分区字段，待业务确认"})
    return result
```

## 4.3 数据质量分析脚本

建议建立：

```text
tools/profile_dataset.py
```

参考代码：

```python
from pathlib import Path
import pandas as pd
import numpy as np
import csv

INPUT_FILE = Path(r"F:\dataspace\供水-张家口\修复结果_已替换.xlsx")
OUTPUT_DIR = Path("analysis-output")
OUTPUT_DIR.mkdir(exist_ok=True)

def profile_series(series: pd.Series) -> dict:
    total = len(series)
    non_null = series.notna().sum()
    missing = total - non_null
    unique_count = series.nunique(dropna=True)

    row = {
        "field": series.name,
        "total_rows": total,
        "non_null": int(non_null),
        "missing": int(missing),
        "missing_rate": missing / total if total else 0,
        "unique_count": int(unique_count),
        "duplicate_rate": 1 - unique_count / non_null if non_null else 0,
    }

    numeric = pd.to_numeric(series, errors="coerce")
    if numeric.notna().sum() > 0:
        row.update({
            "min": numeric.min(),
            "max": numeric.max(),
            "mean": numeric.mean(),
            "std": numeric.std(),
            "p25": numeric.quantile(0.25),
            "p50": numeric.quantile(0.50),
            "p75": numeric.quantile(0.75),
            "negative_count": int((numeric < 0).sum()),
            "zero_rate": float((numeric == 0).sum() / len(numeric)),
        })
        diff = numeric.diff().abs()
        row["jump_count"] = int((diff > diff.quantile(0.99)).sum()) if diff.notna().sum() > 10 else 0
    return row

def sampling_interval(time_series: pd.Series) -> dict:
    t = pd.to_datetime(time_series, errors="coerce").dropna().sort_values()
    if len(t) < 2:
        return {"time_field": time_series.name, "median_interval_seconds": None}
    seconds = t.diff().dropna().dt.total_seconds()
    return {
        "time_field": time_series.name,
        "min_time": t.min().isoformat(),
        "max_time": t.max().isoformat(),
        "median_interval_seconds": seconds.median(),
        "max_interval_seconds": seconds.max(),
    }

def main():
    df = pd.read_excel(INPUT_FILE)
    df = df.dropna(how="all")

    profiles = [profile_series(df[col]) for col in df.columns]
    pd.DataFrame(profiles).to_csv(OUTPUT_DIR / "data_profile.csv", index=False, encoding="utf-8-sig")

    missing = [p for p in profiles if p["missing"] > 0]
    pd.DataFrame(missing).to_csv(OUTPUT_DIR / "missing_report.csv", index=False, encoding="utf-8-sig")

    time_fields = [c for c in df.columns if "时间" in str(c) or "time" in str(c).lower()]
    sampling = [sampling_interval(df[c]) for c in time_fields]
    pd.DataFrame(sampling).to_csv(OUTPUT_DIR / "sampling_interval_report.csv", index=False, encoding="utf-8-sig")

    outlier_rows = []
    for col in df.columns:
        numeric = pd.to_numeric(df[col], errors="coerce")
        if numeric.notna().sum() < 10:
            continue
        q1, q3 = numeric.quantile(0.25), numeric.quantile(0.75)
        iqr = q3 - q1
        lower, upper = q1 - 1.5 * iqr, q3 + 1.5 * iqr
        outlier_rows.append({
            "field": col,
            "outlier_count": int(((numeric < lower) | (numeric > upper)).sum()),
            "lower": lower,
            "upper": upper,
        })
    pd.DataFrame(outlier_rows).to_csv(OUTPUT_DIR / "outlier_report.csv", index=False, encoding="utf-8-sig")

    with open(OUTPUT_DIR / "data_quality_report.md", "w", encoding="utf-8") as f:
        f.write("# 数据质量分析报告\n\n")
        f.write(f"- 文件：{INPUT_FILE}\n")
        f.write(f"- 行数：{len(df)}\n")
        f.write(f"- 字段数：{len(df.columns)}\n")
        f.write("- 注意：本报告只输出问题线索，不删除或覆盖原始数据。\n")

if __name__ == "__main__":
    main()
```

输出：

```text
analysis-output/
  data_profile.csv
  missing_report.csv
  duplicate_report.csv
  outlier_report.csv
  sampling_interval_report.csv
  field_business_dictionary.csv
  data_quality_report.md
```

## 4.4 处理后数据字段设计

| 字段 | 含义 |
|---|---|
| raw_value | 原始值 |
| processed_value | 处理后的值 |
| quality_flag | 数据质量标记 |
| repair_method | 修复方法 |
| repair_confidence | 修复置信度 |
| is_imputed | 是否补全 |
| process_version | 处理版本 |

数据处理前后对比示例：

| time | metric | raw_value | processed_value | quality_flag | repair_method | is_imputed |
|---|---|---:|---:|---|---|---|
| 2026-07-01 00:00 | flow | 8.2 | 8.2 | normal | none | false |
| 2026-07-01 00:15 | flow | null | 8.4 | missing | moving_average | true |
| 2026-07-01 00:30 | flow | -0.4 | -0.4 | business_or_sensor_abnormal_pending | none | false |

负值不一定能直接删除，必须由业务确认是传感器问题、倒流、计量误差还是其他业务现象。


# 5. 数据库设计


### 数据库设计

**目标：**
把水务业务数据拆成系统管理、主数据、时序数据、算法管理、场景管理、结果告警六类，避免所有数据混在一张表里。

**前置条件：**
已完成需求梳理、数据扫描和字段字典初稿；已确定使用PostgreSQL + TimescaleDB + Redis + MinIO。

**具体操作：**
1. 划分数据类型。
2. 设计命名规范。
3. 设计ER关系。
4. 分批建表。
5. 为高频时序数据设计TimescaleDB超表。
6. 使用Alembic管理迁移。

**推荐技术：**
PostgreSQL 16、TimescaleDB、SQLAlchemy、Alembic、MinIO、Redis。

**参考代码：**
本步骤涉及的SQL、Python、FastAPI、Angular或配置示例见本章下方代码块；如果本步骤不直接写代码，则提交对应的配置、表格、页面设计或验收清单。

**输入：**
12场景清单、字段业务字典、数据质量报告、算法和场景流程需求。

**输出：**
数据库表设计、建表SQL、ORM模型、Alembic迁移文件。

**验收方法：**
基础表可创建；外键和索引存在；ts_measurement可以写入并查询；迁移可重复执行。

**常见问题：**
把高频数据存入普通业务表；用中文名做主键；手工改生产表；忘记创建TimescaleDB扩展。

**下一步：**
进入数据库建库建表和后端ORM开发。


## 5.1 数据库分类

| 类别 | 存储内容 | 存储位置 | 示例 |
|---|---|---|---|
| 系统管理表 | 用户、角色、权限、组织、菜单 | PostgreSQL | sys_user、sys_role |
| 主数据表 | 设备、监测点、指标定义、分区、台账 | PostgreSQL | device_asset、monitor_point |
| 时序数据表 | 高频监测数据、处理值、质量标记 | TimescaleDB | ts_measurement |
| 算法管理表 | 算法、版本、模型、参数、输入输出 | PostgreSQL + MinIO | algorithm_registry、model_file |
| 场景管理表 | 场景定义、数据源绑定、算法绑定、流程节点 | PostgreSQL | scenario_definition |
| 结果与告警表 | 预测结果、异常结果、告警、处置、模型指标 | PostgreSQL + TimescaleDB视情况 | prediction_result、alarm_event |

主数据是变化慢、描述业务对象的数据，例如设备台账、监测点、DMA、小区、指标定义。时序数据是按时间不断增长的数据，例如流量、压力、水位、雨量。高频时序数据不能存到普通业务表，否则查询和写入会很快变慢。

MinIO存文件：原始导入文件副本、模型文件、报告附件。Redis存临时状态：任务进度、缓存、WebSocket订阅状态。Redis不能作为长期结果库。

## 5.2 数据库命名规范

- 表名使用小写下划线：`monitor_point`。
- 主键统一为`id`。
- 外键统一为`xxx_id`。
- 时间字段统一为`created_at`、`updated_at`。
- 状态字段统一为`status`。
- JSON扩展字段统一为`metadata`或`config`。
- 业务编码字段统一为`xxx_code`。
- 不使用中文表名或中文字段名。

## 5.3 建库步骤

```sql
CREATE DATABASE smart_water_dev;

CREATE USER smart_water_user
WITH PASSWORD 'change_me';

GRANT ALL PRIVILEGES
ON DATABASE smart_water_dev
TO smart_water_user;
```

连接数据库后：

```sql
CREATE EXTENSION IF NOT EXISTS timescaledb;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

## 5.4 分阶段建表

第一批：系统基础表：`sys_user`、`sys_role`、`sys_permission`、`sys_org`、`sys_user_role`、`sys_role_permission`。

第二批：数据基础表：`data_source`、`data_ingest_task`、`data_ingest_log`、`device_asset`、`monitor_point`、`metric_definition`。

第三批：时序数据表：`ts_measurement`、`timeseries_index`、`data_quality_result`。

第四批：算法管理表：`algorithm_registry`、`algorithm_version`、`model_file`、`algorithm_parameter`、`algorithm_io_definition`。

第五批：场景管理表：`scenario_definition`、`scenario_data_source`、`scenario_algorithm`、`scenario_flow_node`。

第六批：运行结果表：`task_instance`、`task_execution_log`、`prediction_result`、`anomaly_result`、`alarm_event`、`alarm_disposal`、`model_metric`。

## 5.5 建表SQL示例

以下SQL可作为第一版开发表结构。生产环境应通过Alembic迁移执行。

```sql
CREATE TABLE sys_org (
    id BIGSERIAL PRIMARY KEY,
    parent_id BIGINT REFERENCES sys_org(id),
    org_code VARCHAR(64) NOT NULL UNIQUE,
    org_name VARCHAR(128) NOT NULL,
    org_type VARCHAR(32),
    status VARCHAR(16) NOT NULL DEFAULT 'active',
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE sys_user (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(64) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(64) NOT NULL,
    org_id BIGINT REFERENCES sys_org(id),
    status VARCHAR(16) NOT NULL DEFAULT 'active',
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE sys_role (
    id BIGSERIAL PRIMARY KEY,
    role_code VARCHAR(64) NOT NULL UNIQUE,
    role_name VARCHAR(64) NOT NULL,
    status VARCHAR(16) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE sys_permission (
    id BIGSERIAL PRIMARY KEY,
    perm_code VARCHAR(128) NOT NULL UNIQUE,
    perm_name VARCHAR(128) NOT NULL,
    perm_type VARCHAR(32) NOT NULL,
    resource VARCHAR(255),
    action VARCHAR(32),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE sys_user_role (
    user_id BIGINT NOT NULL REFERENCES sys_user(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES sys_role(id) ON DELETE CASCADE,
    PRIMARY KEY(user_id, role_id)
);

CREATE TABLE sys_role_permission (
    role_id BIGINT NOT NULL REFERENCES sys_role(id) ON DELETE CASCADE,
    permission_id BIGINT NOT NULL REFERENCES sys_permission(id) ON DELETE CASCADE,
    PRIMARY KEY(role_id, permission_id)
);

CREATE TABLE data_source (
    id BIGSERIAL PRIMARY KEY,
    source_code VARCHAR(64) NOT NULL UNIQUE,
    source_name VARCHAR(128) NOT NULL,
    source_type VARCHAR(32) NOT NULL,
    conn_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    auth_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    status VARCHAR(16) NOT NULL DEFAULT 'inactive',
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE data_ingest_task (
    id BIGSERIAL PRIMARY KEY,
    task_code VARCHAR(64) NOT NULL UNIQUE,
    source_id BIGINT REFERENCES data_source(id),
    task_type VARCHAR(32) NOT NULL,
    file_uri VARCHAR(512),
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    total_rows INTEGER DEFAULT 0,
    success_rows INTEGER DEFAULT 0,
    failed_rows INTEGER DEFAULT 0,
    error_message TEXT,
    created_by BIGINT REFERENCES sys_user(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE data_ingest_log (
    id BIGSERIAL PRIMARY KEY,
    ingest_task_id BIGINT REFERENCES data_ingest_task(id) ON DELETE CASCADE,
    level VARCHAR(16) NOT NULL,
    message TEXT NOT NULL,
    detail JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE device_asset (
    id BIGSERIAL PRIMARY KEY,
    device_code VARCHAR(128) NOT NULL UNIQUE,
    device_name VARCHAR(128) NOT NULL,
    device_type VARCHAR(32) NOT NULL,
    manufacturer VARCHAR(64),
    model VARCHAR(64),
    install_date DATE,
    status VARCHAR(16) NOT NULL DEFAULT 'active',
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE metric_definition (
    id BIGSERIAL PRIMARY KEY,
    metric_code VARCHAR(64) NOT NULL UNIQUE,
    metric_name VARCHAR(128) NOT NULL,
    metric_type VARCHAR(32),
    unit VARCHAR(32),
    description TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE monitor_point (
    id BIGSERIAL PRIMARY KEY,
    point_code VARCHAR(128) NOT NULL UNIQUE,
    point_name VARCHAR(128) NOT NULL,
    point_type VARCHAR(32) NOT NULL,
    device_id BIGINT REFERENCES device_asset(id),
    area_code VARCHAR(64),
    dma_code VARCHAR(64),
    metric_code VARCHAR(64),
    unit VARCHAR(32),
    sample_interval_sec INTEGER,
    longitude NUMERIC(10,6),
    latitude NUMERIC(10,6),
    status VARCHAR(16) NOT NULL DEFAULT 'active',
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_monitor_point_type ON monitor_point(point_type);
CREATE INDEX idx_monitor_point_dma ON monitor_point(dma_code);
```

为什么需要`point_code`：监测点名称可能会改，且不同区域可能重名，不能用`point_name`做主键。`point_code`作为业务编码保持稳定。`point_type`候选值包括`flow`、`pressure`、`level`、`rainfall`、`quality`、`meter`、`pump`、`valve`。`metadata`保存扩展信息，例如安装位置、厂家字段、外部系统ID、坐标精度等。

## 5.6 TimescaleDB时序表

```sql
CREATE TABLE ts_measurement (
    time TIMESTAMPTZ NOT NULL,
    point_id BIGINT NOT NULL REFERENCES monitor_point(id),
    metric_code VARCHAR(64) NOT NULL,
    raw_value DOUBLE PRECISION,
    processed_value DOUBLE PRECISION,
    quality_flag VARCHAR(32),
    repair_method VARCHAR(64),
    repair_confidence NUMERIC(6,4),
    is_imputed BOOLEAN NOT NULL DEFAULT FALSE,
    process_version VARCHAR(64),
    source_id BIGINT REFERENCES data_source(id),
    ingest_task_id BIGINT REFERENCES data_ingest_task(id),
    metadata JSONB DEFAULT '{}'::jsonb
);

SELECT create_hypertable(
    'ts_measurement',
    'time',
    if_not_exists => TRUE
);

CREATE INDEX idx_ts_point_metric_time
ON ts_measurement(point_id, metric_code, time DESC);

CREATE INDEX idx_ts_quality_flag
ON ts_measurement(quality_flag);
```

为什么不用普通自增主键：时序数据天然按时间、点位、指标查询，自增ID对查询一天、一周、一月曲线帮助不大。按`point_id, metric_code, time DESC`建索引，能快速查询某点位某指标的时间窗。

查询一天数据：

```sql
SELECT time, processed_value, quality_flag
FROM ts_measurement
WHERE point_id = 1001
  AND metric_code = 'flow'
  AND time >= '2026-07-01 00:00:00+08'
  AND time <  '2026-07-02 00:00:00+08'
ORDER BY time;
```

按15分钟降采样：

```sql
SELECT time_bucket('15 minutes', time) AS bucket,
       AVG(processed_value) AS avg_value
FROM ts_measurement
WHERE point_id = 1001
  AND metric_code = 'flow'
  AND time >= NOW() - INTERVAL '7 days'
GROUP BY bucket
ORDER BY bucket;
```

连续聚合示例：

```sql
CREATE MATERIALIZED VIEW ts_measurement_1h
WITH (timescaledb.continuous) AS
SELECT time_bucket('1 hour', time) AS bucket,
       point_id,
       metric_code,
       AVG(processed_value) AS avg_value,
       MIN(processed_value) AS min_value,
       MAX(processed_value) AS max_value
FROM ts_measurement
GROUP BY bucket, point_id, metric_code;
```

## 5.7 其余核心表SQL

```sql
CREATE TABLE timeseries_index (
    id BIGSERIAL PRIMARY KEY,
    point_id BIGINT NOT NULL REFERENCES monitor_point(id),
    metric_code VARCHAR(64) NOT NULL,
    storage_engine VARCHAR(32) NOT NULL DEFAULT 'timescaledb',
    table_name VARCHAR(128) NOT NULL DEFAULT 'ts_measurement',
    retention_days INTEGER,
    downsample_policy JSONB NOT NULL DEFAULT '{}'::jsonb,
    UNIQUE(point_id, metric_code)
);

CREATE TABLE data_quality_result (
    id BIGSERIAL PRIMARY KEY,
    point_id BIGINT REFERENCES monitor_point(id),
    metric_code VARCHAR(64),
    window_start TIMESTAMPTZ,
    window_end TIMESTAMPTZ,
    quality_type VARCHAR(32) NOT NULL,
    score NUMERIC(6,4),
    detail JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE algorithm_registry (
    id BIGSERIAL PRIMARY KEY,
    algorithm_code VARCHAR(64) NOT NULL UNIQUE,
    algorithm_name VARCHAR(128) NOT NULL,
    algorithm_type VARCHAR(32) NOT NULL,
    description TEXT,
    status VARCHAR(16) NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE algorithm_version (
    id BIGSERIAL PRIMARY KEY,
    algorithm_id BIGINT NOT NULL REFERENCES algorithm_registry(id),
    version VARCHAR(32) NOT NULL,
    entrypoint VARCHAR(255),
    runtime_mode VARCHAR(32) NOT NULL DEFAULT 'python_package',
    package_uri VARCHAR(512),
    image_uri VARCHAR(512),
    io_schema JSONB NOT NULL DEFAULT '{}'::jsonb,
    runtime_requirements JSONB NOT NULL DEFAULT '{}'::jsonb,
    status VARCHAR(16) NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(algorithm_id, version)
);

CREATE TABLE model_file (
    id BIGSERIAL PRIMARY KEY,
    algorithm_version_id BIGINT NOT NULL REFERENCES algorithm_version(id),
    model_name VARCHAR(128) NOT NULL,
    model_uri VARCHAR(512) NOT NULL,
    config_uri VARCHAR(512),
    checksum VARCHAR(128),
    status VARCHAR(16) NOT NULL DEFAULT 'uploaded',
    metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE algorithm_parameter (
    id BIGSERIAL PRIMARY KEY,
    algorithm_version_id BIGINT NOT NULL REFERENCES algorithm_version(id),
    param_name VARCHAR(64) NOT NULL,
    param_type VARCHAR(32) NOT NULL,
    default_value JSONB,
    range_rule JSONB NOT NULL DEFAULT '{}'::jsonb,
    required BOOLEAN NOT NULL DEFAULT FALSE,
    ui_schema JSONB NOT NULL DEFAULT '{}'::jsonb,
    UNIQUE(algorithm_version_id, param_name)
);

CREATE TABLE algorithm_io_definition (
    id BIGSERIAL PRIMARY KEY,
    algorithm_version_id BIGINT NOT NULL REFERENCES algorithm_version(id),
    io_type VARCHAR(16) NOT NULL,
    field_name VARCHAR(64) NOT NULL,
    field_type VARCHAR(32) NOT NULL,
    unit VARCHAR(32),
    required BOOLEAN NOT NULL DEFAULT FALSE,
    mapping_rule JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE scenario_definition (
    id BIGSERIAL PRIMARY KEY,
    scenario_code VARCHAR(64) NOT NULL UNIQUE,
    scenario_name VARCHAR(128) NOT NULL,
    phase VARCHAR(32) NOT NULL,
    menu_path VARCHAR(255),
    status VARCHAR(16) NOT NULL DEFAULT 'draft',
    config_schema JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE scenario_data_source (
    id BIGSERIAL PRIMARY KEY,
    scenario_id BIGINT NOT NULL REFERENCES scenario_definition(id),
    source_id BIGINT REFERENCES data_source(id),
    point_filter JSONB NOT NULL DEFAULT '{}'::jsonb,
    mapping_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    required BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE scenario_algorithm (
    id BIGSERIAL PRIMARY KEY,
    scenario_id BIGINT NOT NULL REFERENCES scenario_definition(id),
    algorithm_version_id BIGINT NOT NULL REFERENCES algorithm_version(id),
    node_code VARCHAR(64) NOT NULL,
    order_no INTEGER NOT NULL DEFAULT 0,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    param_override JSONB NOT NULL DEFAULT '{}'::jsonb,
    UNIQUE(scenario_id, node_code)
);

CREATE TABLE scenario_flow_node (
    id BIGSERIAL PRIMARY KEY,
    scenario_id BIGINT NOT NULL REFERENCES scenario_definition(id),
    node_code VARCHAR(64) NOT NULL,
    node_type VARCHAR(32) NOT NULL,
    node_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    upstream_nodes TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    timeout_sec INTEGER DEFAULT 600,
    retry_policy JSONB NOT NULL DEFAULT '{}'::jsonb,
    UNIQUE(scenario_id, node_code)
);

CREATE TABLE task_instance (
    id BIGSERIAL PRIMARY KEY,
    task_code VARCHAR(64) NOT NULL UNIQUE,
    task_type VARCHAR(32) NOT NULL,
    scenario_id BIGINT REFERENCES scenario_definition(id),
    algorithm_version_id BIGINT REFERENCES algorithm_version(id),
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    trace_id VARCHAR(64) NOT NULL,
    params JSONB NOT NULL DEFAULT '{}'::jsonb,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE task_execution_log (
    id BIGSERIAL PRIMARY KEY,
    task_id BIGINT NOT NULL REFERENCES task_instance(id) ON DELETE CASCADE,
    node_code VARCHAR(64),
    level VARCHAR(16) NOT NULL,
    message TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE prediction_result (
    id BIGSERIAL PRIMARY KEY,
    task_id BIGINT REFERENCES task_instance(id),
    scenario_id BIGINT REFERENCES scenario_definition(id),
    point_id BIGINT REFERENCES monitor_point(id),
    target_metric VARCHAR(64) NOT NULL,
    forecast_time TIMESTAMPTZ NOT NULL,
    horizon_sec INTEGER,
    yhat DOUBLE PRECISION,
    p10 DOUBLE PRECISION,
    p50 DOUBLE PRECISION,
    p90 DOUBLE PRECISION,
    source_window JSONB NOT NULL DEFAULT '{}'::jsonb,
    algorithm_version_id BIGINT REFERENCES algorithm_version(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE anomaly_result (
    id BIGSERIAL PRIMARY KEY,
    task_id BIGINT REFERENCES task_instance(id),
    scenario_id BIGINT REFERENCES scenario_definition(id),
    point_id BIGINT REFERENCES monitor_point(id),
    metric_code VARCHAR(64),
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    anomaly_score NUMERIC(8,4),
    anomaly_type VARCHAR(64),
    root_cause JSONB NOT NULL DEFAULT '{}'::jsonb,
    evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE alarm_event (
    id BIGSERIAL PRIMARY KEY,
    alarm_code VARCHAR(64) NOT NULL UNIQUE,
    scenario_id BIGINT REFERENCES scenario_definition(id),
    source_type VARCHAR(32) NOT NULL,
    source_result_id BIGINT,
    level VARCHAR(16) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    status VARCHAR(16) NOT NULL DEFAULT 'open',
    first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE alarm_disposal (
    id BIGSERIAL PRIMARY KEY,
    alarm_id BIGINT NOT NULL REFERENCES alarm_event(id),
    action VARCHAR(32) NOT NULL,
    handler_id BIGINT REFERENCES sys_user(id),
    comment TEXT,
    attachment_uri VARCHAR(512),
    handled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    next_status VARCHAR(16)
);

CREATE TABLE model_metric (
    id BIGSERIAL PRIMARY KEY,
    task_id BIGINT REFERENCES task_instance(id),
    model_file_id BIGINT REFERENCES model_file(id),
    metric_name VARCHAR(64) NOT NULL,
    metric_value DOUBLE PRECISION NOT NULL,
    metric_unit VARCHAR(32),
    detail JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## 5.8 Alembic数据库迁移

```bash
alembic init migrations
alembic revision --autogenerate -m "create base tables"
alembic upgrade head
alembic downgrade -1
```

SQLAlchemy模型示例：

```python
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String, DateTime, func

class Base(DeclarativeBase):
    pass

class DataSource(Base):
    __tablename__ = "data_source"

    id: Mapped[int] = mapped_column(primary_key=True)
    source_code: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    source_name: Mapped[str] = mapped_column(String(128))
    source_type: Mapped[str] = mapped_column(String(32))
    status: Mapped[str] = mapped_column(String(16), default="inactive")
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
```

禁止直接在生产库手工改表。结构改变必须改ORM模型、生成迁移、评审迁移SQL、再执行升级。

# 6. 数据库建库建表


### 数据库建库建表

**目标：**
按照分批建表顺序创建开发库，并用Alembic管理结构变更。

**前置条件：**
PostgreSQL/TimescaleDB已启动；DATABASE_URL正确；SQL设计已评审。

**具体操作：**
1. 创建数据库和用户。
2. 启用TimescaleDB和pgcrypto扩展。
3. 创建第一批系统基础表。
4. 创建第二批数据基础表。
5. 创建第三批时序表。
6. 创建算法、场景和结果表。
7. 建立索引。
8. 初始化基础字典和12个场景。

**推荐技术：**
PostgreSQL SQL、TimescaleDB、Alembic、DBeaver/Navicat。

**参考代码：**
本步骤涉及的SQL、Python、FastAPI、Angular或配置示例见本章下方代码块；如果本步骤不直接写代码，则提交对应的配置、表格、页面设计或验收清单。

**输入：**
建表SQL、ORM模型、迁移脚本。

**输出：**
smart_water_dev数据库、所有基础表、索引、初始化场景数据。

**验收方法：**
alembic upgrade head成功；表数量正确；ts_measurement为hypertable；能插入并查询一条时序数据。

**常见问题：**
没有权限创建扩展；迁移重复；忘记索引；外键指向不存在表。

**下一步：**
进入数据接入与后端业务开发。


# 7. 数据接入与数据处理


### 数据接入与数据处理

**目标：**
实现从数据源配置、文件导入、字段映射、数据校验到时序数据入库的完整流程。

**前置条件：**
数据库基础表已创建；后端工程已启动；原始数据目录只读；字段字典已有初稿。

**具体操作：**
1. 创建数据源。
2. 上传文件或扫描目录。
3. 创建导入任务。
4. 读取文件并检查格式。
5. 应用字段映射。
6. 校验时间、点位、数值。
7. 批量写入ts_measurement。
8. 记录导入日志和失败数据。
9. WebSocket推送进度。

**推荐技术：**
FastAPI、Pandas、openpyxl、SQLAlchemy、PostgreSQL COPY、Celery、WebSocket。

**参考代码：**
本步骤涉及的SQL、Python、FastAPI、Angular或配置示例见本章下方代码块；如果本步骤不直接写代码，则提交对应的配置、表格、页面设计或验收清单。

**输入：**
data_source配置、Excel/CSV文件、字段映射JSON、监测点表。

**输出：**
data_ingest_task、data_ingest_log、ts_measurement记录、错误报告、导入结果JSON。

**验收方法：**
正确文件可成功入库；缺字段文件返回明确错误；重复导入可识别；任务状态从pending流转到success/failed。

**常见问题：**
逐行insert导致慢；时间字段解析失败；字段映射写死；大文件内存溢出；失败批次没有日志。

**下一步：**
进入数据质量分析和算法接入。


数据入库流程：

```text
选择数据源
→ 上传文件或扫描目录
→ 创建导入任务
→ 读取文件
→ 检查格式
→ 字段映射
→ 数据校验
→ 监测点匹配
→ 时间格式转换
→ 单位转换
→ 批量写入
→ 记录导入日志
→ 返回导入结果
```

## 7.1 导入任务状态

| 状态 | 含义 |
|---|---|
| pending | 已创建任务，等待执行 |
| validating | 正在检查文件格式、字段、数据源 |
| mapping | 正在应用字段映射 |
| importing | 正在批量写入数据库 |
| success | 全部成功 |
| partial_success | 部分成功，存在失败行 |
| failed | 任务失败，未完成导入 |

## 7.2 Excel导入示例

```python
import pandas as pd

def load_excel(file_path: str, sheet_name: str, mapping: dict) -> pd.DataFrame:
    df = pd.read_excel(file_path, sheet_name=sheet_name)
    df = df.dropna(how="all")

    rename_map = {}
    for source_field, target in mapping.items():
        if isinstance(target, str):
            rename_map[source_field] = target
        else:
            rename_map[source_field] = target["target"]

    missing = [field for field in rename_map if field not in df.columns]
    if missing:
        raise ValueError(f"字段映射不完整，缺少字段: {missing}")

    df = df.rename(columns=rename_map)
    df["time"] = pd.to_datetime(df["time"], errors="coerce")

    invalid_time = df["time"].isna().sum()
    if invalid_time > 0:
        # 不直接删除，先输出错误报告；是否跳过由导入策略决定
        df.loc[df["time"].isna(), "quality_flag"] = "invalid_time"

    df = df.drop_duplicates(subset=["device_name", "time"], keep="last")
    return df

mapping = {
    "设备名称": "device_name",
    "时间": "time",
    "压力(MPa)": {"target": "pressure", "unit": "MPa"},
    "流量(m³/h)": {"target": "flow", "unit": "m3/h"}
}
```

## 7.3 字段映射配置

字段映射由前端配置并保存到数据库，不应在代码中写死。

```json
{
  "设备名称": "device_name",
  "时间": "time",
  "压力(MPa)": {
    "target": "pressure",
    "unit": "MPa"
  },
  "流量(m³/h)": {
    "target": "flow",
    "unit": "m3/h"
  }
}
```

前端保存到`scenario_data_source.mapping_config`或数据源专用映射表中。

## 7.4 批量写入

大文件不能逐行insert。建议每批5000至20000行。

SQLAlchemy批量示例：

```python
from sqlalchemy import insert

def bulk_insert_measurements(session, rows: list[dict], batch_size: int = 10000):
    for start in range(0, len(rows), batch_size):
        batch = rows[start:start + batch_size]
        try:
            session.execute(insert(TsMeasurement), batch)
            session.commit()
        except Exception:
            session.rollback()
            # 记录失败批次，生成错误报告
            raise
```

COPY思路：

```python
import io

def copy_to_postgres(raw_connection, rows: list[dict]):
    buffer = io.StringIO()
    for r in rows:
        buffer.write(
            f"{r['time']}\t{r['point_id']}\t{r['metric_code']}\t"
            f"{r.get('raw_value', '')}\t{r.get('processed_value', '')}\t"
            f"{r.get('quality_flag', '')}\n"
        )
    buffer.seek(0)
    with raw_connection.cursor() as cur:
        cur.copy_from(
            buffer,
            "ts_measurement",
            columns=("time", "point_id", "metric_code", "raw_value", "processed_value", "quality_flag"),
            null=""
        )
    raw_connection.commit()
```

失败数据报告示例：

| row_number | error_type | error_message | raw_data |
|---:|---|---|---|
| 102 | invalid_time | 时间字段无法解析 | {...} |
| 205 | missing_point | 找不到监测点 | {...} |


# 8. 后端工程设计


### 后端工程设计

**目标：**
搭建可维护的FastAPI后端工程，禁止把所有代码写在main.py里。

**前置条件：**
Python虚拟环境已准备；数据库和Redis/RabbitMQ/MinIO已启动；requirements.txt已安装。

**具体操作：**
1. 创建目录结构。
2. 配置数据库连接。
3. 定义统一返回结构。
4. 建立API、Schema、Service、Repository、Model分层。
5. 实现数据源新增接口作为模板。
6. 编写单元测试。

**推荐技术：**
FastAPI、SQLAlchemy、Pydantic、Alembic、pytest、python-jose、Celery。

**参考代码：**
本步骤涉及的SQL、Python、FastAPI、Angular或配置示例见本章下方代码块；如果本步骤不直接写代码，则提交对应的配置、表格、页面设计或验收清单。

**输入：**
.env、数据库表、接口需求。

**输出：**
backend工程、Swagger文档、统一响应、示例接口、测试用例。

**验收方法：**
FastAPI可启动；Swagger可访问；数据源新增接口可创建记录；测试通过。

**常见问题：**
循环导入；数据库Session未关闭；Pydantic模型和ORM模型混用；异常返回不统一。

**下一步：**
继续实现数据接入、质量分析、算法、场景、告警等业务逻辑。


## 8.1 后端目录结构

```text
backend/
├─ app/
│  ├─ main.py
│  ├─ core/
│  │  ├─ config.py
│  │  ├─ database.py
│  │  ├─ security.py
│  │  ├─ logging.py
│  │  ├─ exceptions.py
│  │  └─ response.py
│  ├─ models/
│  ├─ schemas/
│  ├─ repositories/
│  ├─ services/
│  ├─ api/
│  │  └─ v1/
│  ├─ algorithms/
│  ├─ workers/
│  ├─ schedulers/
│  ├─ adapters/
│  └─ utils/
├─ migrations/
├─ tests/
├─ requirements.txt
└─ .env
```

目录职责：

| 目录 | 职责 |
|---|---|
| core | 配置、数据库、权限、安全、异常、统一返回 |
| models | SQLAlchemy ORM模型 |
| schemas | Pydantic请求和响应模型 |
| repositories | 数据库查询和持久化 |
| services | 业务逻辑 |
| api/v1 | 路由和接口 |
| algorithms | 内置算法和算法基类 |
| workers | Celery异步任务 |
| schedulers | 定时任务 |
| adapters | MinIO、Redis、RabbitMQ、外部系统适配 |
| tests | 单元测试和接口测试 |

## 8.2 后端分层

```text
API层
→ Schema层
→ Service层
→ Repository层
→ ORM Model层
→ Database层
```

- API层只处理请求、响应、权限，不写复杂业务。
- Schema层负责参数校验。
- Service层实现业务流程。
- Repository层负责数据库查询。
- Model层描述表结构。
- Database层管理连接和事务。

## 8.3 统一返回结构

```python
from pydantic import BaseModel
from typing import Any
from uuid import uuid4

class ApiResponse(BaseModel):
    code: int = 0
    message: str = "success"
    data: Any = None
    trace_id: str

def success(data=None, trace_id: str | None = None):
    return ApiResponse(data=data, trace_id=trace_id or str(uuid4()))

def fail(code: int, message: str, data=None, trace_id: str | None = None):
    return ApiResponse(code=code, message=message, data=data, trace_id=trace_id or str(uuid4()))
```

成功：

```json
{
  "code": 0,
  "message": "success",
  "data": {},
  "trace_id": "uuid"
}
```

失败：

```json
{
  "code": 40001,
  "message": "字段映射不完整",
  "data": {
    "missing_fields": ["time", "flow"]
  },
  "trace_id": "uuid"
}
```

## 8.4 数据源新增接口完整示例

Model：

```python
# app/models/data_source.py
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, JSON, DateTime, func
from app.core.database import Base

class DataSource(Base):
    __tablename__ = "data_source"

    id: Mapped[int] = mapped_column(primary_key=True)
    source_code: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    source_name: Mapped[str] = mapped_column(String(128))
    source_type: Mapped[str] = mapped_column(String(32))
    conn_config: Mapped[dict] = mapped_column(JSON, default=dict)
    auth_config: Mapped[dict] = mapped_column(JSON, default=dict)
    status: Mapped[str] = mapped_column(String(16), default="inactive")
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
```

Schema：

```python
# app/schemas/data_source.py
from pydantic import BaseModel, Field

class DataSourceCreate(BaseModel):
    source_code: str = Field(min_length=2, max_length=64)
    source_name: str
    source_type: str
    conn_config: dict = {}
    auth_config: dict = {}

class DataSourceOut(BaseModel):
    id: int
    source_code: str
    source_name: str
    source_type: str
    status: str

    model_config = {"from_attributes": True}
```

Repository：

```python
# app/repositories/data_source_repository.py
from sqlalchemy.orm import Session
from app.models.data_source import DataSource

class DataSourceRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_code(self, source_code: str) -> DataSource | None:
        return self.db.query(DataSource).filter(DataSource.source_code == source_code).first()

    def create(self, data: dict) -> DataSource:
        obj = DataSource(**data)
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj
```

Service：

```python
# app/services/data_source_service.py
from app.repositories.data_source_repository import DataSourceRepository
from app.schemas.data_source import DataSourceCreate

class DataSourceService:
    def __init__(self, repo: DataSourceRepository):
        self.repo = repo

    def create_source(self, payload: DataSourceCreate):
        if self.repo.get_by_code(payload.source_code):
            raise ValueError("数据源编码已存在")
        return self.repo.create(payload.model_dump())
```

Router：

```python
# app/api/v1/data_source.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.response import success
from app.repositories.data_source_repository import DataSourceRepository
from app.services.data_source_service import DataSourceService
from app.schemas.data_source import DataSourceCreate, DataSourceOut

router = APIRouter(prefix="/data-sources", tags=["Data Sources"])

@router.post("")
def create_data_source(payload: DataSourceCreate, db: Session = Depends(get_db)):
    service = DataSourceService(DataSourceRepository(db))
    try:
        obj = service.create_source(payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    return success(DataSourceOut.model_validate(obj).model_dump())
```

单元测试：

```python
def test_create_data_source(client):
    payload = {
        "source_code": "excel_local",
        "source_name": "本地Excel文件",
        "source_type": "file",
        "conn_config": {"root": "analysis-output"},
        "auth_config": {}
    }
    resp = client.post("/api/v1/data-sources", json=payload)
    assert resp.status_code == 200
    body = resp.json()
    assert body["code"] == 0
    assert body["data"]["source_code"] == "excel_local"
```


# 9. 后端业务逻辑


### 后端业务逻辑

**目标：**
把数据接入、质量分析、算法训练、在线推理、告警生成和WebSocket推送设计成可执行流程。

**前置条件：**
后端分层已完成；数据表存在；Celery、Redis、RabbitMQ可用；算法基类已定义。

**具体操作：**
1. 定义任务状态。
2. Service创建任务记录。
3. Worker异步执行。
4. Repository保存结果。
5. WebSocket推送进度。
6. 前端轮询或订阅状态。

**推荐技术：**
FastAPI、Celery、Redis、RabbitMQ、SQLAlchemy、WebSocket。

**参考代码：**
本步骤涉及的SQL、Python、FastAPI、Angular或配置示例见本章下方代码块；如果本步骤不直接写代码，则提交对应的配置、表格、页面设计或验收清单。

**输入：**
数据源、数据集、算法版本、模型文件、实时监测数据。

**输出：**
任务实例、任务日志、质量结果、预测结果、异常结果、告警事件。

**验收方法：**
任务能异步执行；失败有日志；接口不阻塞；前端能看到任务进度。

**常见问题：**
Celery worker未启动；broker配置错误；任务异常未捕获；重复创建任务；WebSocket无心跳。

**下一步：**
进入算法统一接入和场景编排。


## 9.1 数据接入逻辑

```text
1. 创建data_source
2. 测试连接
3. 创建data_ingest_task
4. Celery执行导入
5. 更新任务状态
6. 记录data_ingest_log
7. 写入ts_measurement
8. 通过WebSocket推送任务进度
```

Celery任务示例：

```python
@celery_app.task(bind=True)
def run_ingest_task(self, ingest_task_id: int):
    task = ingest_repo.get(ingest_task_id)
    try:
        ingest_repo.update_status(task.id, "validating")
        # 读取文件、校验字段
        ingest_repo.update_status(task.id, "mapping")
        # 字段映射
        ingest_repo.update_status(task.id, "importing")
        # 批量入库
        ingest_repo.update_status(task.id, "success")
    except Exception as exc:
        ingest_repo.update_status(task.id, "failed", error_message=str(exc))
        ingest_log_repo.error(task.id, str(exc))
        raise
```

## 9.2 数据质量分析逻辑

```text
1. 用户选择数据集
2. 后端创建质量分析任务
3. Celery加载数据
4. 计算缺失、重复、异常、冻结、漂移
5. 生成Qscore
6. 保存data_quality_result
7. 生成报告
8. 前端展示
```

Qscore简化示例：

```python
def qscore(completeness: float, validity: float, continuity: float, stability: float) -> float:
    return round(
        0.35 * completeness +
        0.25 * validity +
        0.20 * continuity +
        0.20 * stability,
        4
    )
```

## 9.3 算法训练逻辑

```text
1. 选择算法版本
2. 选择数据集版本
3. 配置参数
4. 创建训练任务
5. 加载数据
6. 调用fit
7. 保存模型文件
8. 计算评估指标
9. 上传MinIO
10. 等待人工审核
11. 发布模型
```

训练任务输出：

```json
{
  "task_id": 123,
  "status": "success",
  "model_file_id": 88,
  "metrics": {
    "mae": 0.12,
    "rmse": 0.24
  }
}
```

## 9.4 在线推理逻辑

```text
1. 接收最新监测数据
2. 校验字段
3. 加载已发布模型
4. 调用predict或detect
5. 后处理
6. 保存结果
7. 执行规则
8. 生成告警
9. WebSocket推送前端
```

推理异常处理：

| 问题 | 处理 |
|---|---|
| 字段缺失 | 返回ALG_400_SCHEMA_MISMATCH |
| 模型文件不存在 | 返回ALG_404_MODEL_NOT_FOUND并通知算法管理员 |
| 模型加载失败 | 回滚到上一发布版本 |
| 推理超时 | 终止任务并记录日志 |
| 规则触发告警失败 | 保存推理结果，告警节点标记失败 |


# 10. 算法统一接入


### 算法统一接入

**目标：**
让统计、规则、机器学习和深度学习算法都以统一目录和接口交付，后端可以统一注册、测试、运行和评估。

**前置条件：**
算法表和模型文件表已创建；MinIO可用；数据集版本可读取。

**具体操作：**
1. 每个算法建立独立目录。
2. 编写algorithm.yaml。
3. 实现model.py中的fit/predict/detect/evaluate。
4. 编写测试数据和测试脚本。
5. 注册算法和版本。
6. 运行测试任务。
7. 发布模型。

**推荐技术：**
Python、Pandas、NumPy、scikit-learn、PyTorch可选、MinIO、Celery。

**参考代码：**
本步骤涉及的SQL、Python、FastAPI、Angular或配置示例见本章下方代码块；如果本步骤不直接写代码，则提交对应的配置、表格、页面设计或验收清单。

**输入：**
数据集版本、算法配置、训练参数、测试数据。

**输出：**
算法包、模型文件、评估指标、算法版本记录。

**验收方法：**
health_check通过；测试脚本通过；算法能由任务执行；结果符合统一JSON格式。

**常见问题：**
字段名写死；输入输出schema不一致；每次请求重复加载模型；模型版本无法回滚。

**下一步：**
进入场景编排，把算法绑定到业务流程节点。


算法目录结构：

```text
algorithms/
  leakage_forecast/
    algorithm.yaml
    model.py
    preprocess.py
    postprocess.py
    requirements.txt
    tests/
      sample_input.json
      test_model.py
```

`algorithm.yaml`示例：

```yaml
algorithm_code: moving_average_forecast
algorithm_name: 移动平均流量预测
algorithm_type: statistical_forecast
version: 1.0.0
requires_gpu: false
entrypoint: model:MovingAverageForecast
input_fields:
  - name: time
    type: datetime
    required: true
  - name: flow
    type: float
    unit: m3/h
    required: true
output_fields:
  - name: forecast_time
    type: datetime
  - name: yhat
    type: float
params:
  window_size: 4
  horizon: 4
```

统一基类：

```python
from abc import ABC, abstractmethod

class WaterAlgorithmBase(ABC):
    algorithm_code: str
    version: str
    requires_gpu: bool = False

    def __init__(self, config: dict):
        self.config = config

    def preprocess(self, payload: dict) -> dict:
        return payload

    def fit(self, dataset: dict) -> dict:
        return {"status": "skipped"}

    def predict(self, payload: dict) -> dict:
        raise NotImplementedError

    def detect(self, payload: dict) -> dict:
        raise NotImplementedError

    def evaluate(self, y_true, y_pred) -> dict:
        return {}

    def save_model(self, uri: str) -> dict:
        return {"model_uri": uri}

    def load_model(self, uri: str) -> None:
        self.model_uri = uri

    def health_check(self) -> dict:
        return {"status": "ok", "algorithm_code": self.algorithm_code, "version": self.version}
```

## 10.1 移动平均预测算法

```python
import pandas as pd
from app.algorithms.base import WaterAlgorithmBase

class MovingAverageForecast(WaterAlgorithmBase):
    algorithm_code = "moving_average_forecast"
    version = "1.0.0"

    def predict(self, payload: dict) -> dict:
        window_size = self.config.get("window_size", 4)
        horizon = self.config.get("horizon", 4)
        series = payload["inputs"][0]["series"]
        df = pd.DataFrame(series, columns=["time", "value"])
        df["time"] = pd.to_datetime(df["time"])
        df["value"] = pd.to_numeric(df["value"], errors="coerce")
        last_time = df["time"].max()
        freq = pd.infer_freq(df["time"]) or "15min"
        yhat = df["value"].tail(window_size).mean()
        future_times = pd.date_range(last_time, periods=horizon + 1, freq=freq)[1:]
        outputs = [
            {"forecast_time": t.isoformat(), "yhat": float(yhat)}
            for t in future_times
        ]
        return {
            "status": "success",
            "result_type": "prediction",
            "outputs": outputs,
            "metrics": {},
            "warnings": []
        }
```

测试：

```python
def test_moving_average_predict():
    algo = MovingAverageForecast({"window_size": 2, "horizon": 2})
    payload = {
        "inputs": [{
            "series": [
                ["2026-07-01T00:00:00+08:00", 8.0],
                ["2026-07-01T00:15:00+08:00", 10.0]
            ]
        }]
    }
    result = algo.predict(payload)
    assert result["status"] == "success"
    assert result["outputs"][0]["yhat"] == 9.0
```

## 10.2 Isolation Forest异常检测算法

```python
import pandas as pd
from sklearn.ensemble import IsolationForest
from app.algorithms.base import WaterAlgorithmBase

class IsolationForestDetector(WaterAlgorithmBase):
    algorithm_code = "isolation_forest_detector"
    version = "1.0.0"

    def fit(self, dataset: dict) -> dict:
        df = pd.DataFrame(dataset["rows"])
        x = df[dataset["feature_fields"]].fillna(method="ffill").fillna(0)
        self.model = IsolationForest(
            contamination=self.config.get("contamination", 0.03),
            random_state=42
        )
        self.model.fit(x)
        return {"status": "success"}

    def detect(self, payload: dict) -> dict:
        df = pd.DataFrame(payload["rows"])
        feature_fields = payload["feature_fields"]
        x = df[feature_fields].fillna(method="ffill").fillna(0)
        scores = -self.model.decision_function(x)
        labels = self.model.predict(x)
        outputs = []
        for i, row in df.iterrows():
            outputs.append({
                "time": row["time"],
                "anomaly_score": float(scores[i]),
                "is_anomaly": bool(labels[i] == -1)
            })
        return {"status": "success", "result_type": "anomaly", "outputs": outputs}
```

深度学习算法区别：

| 问题 | 传统算法 | 深度学习算法 |
|---|---|---|
| GPU | 通常不需要 | 可能需要 |
| 模型文件 | 可选 | 必须有权重文件 |
| 训练 | 快 | 慢，需要任务队列 |
| 加载 | 可以每任务加载 | 应进程启动时缓存，避免每请求重复加载 |
| 版本切换 | 切换参数或pickle | 切换权重文件和配置 |
| 回滚 | 回滚算法版本 | 回滚模型文件和算法版本 |

模型缓存示例：

```python
MODEL_CACHE = {}

def get_model(model_uri: str, loader):
    if model_uri not in MODEL_CACHE:
        MODEL_CACHE[model_uri] = loader(model_uri)
    return MODEL_CACHE[model_uri]
```


# 11. 场景编排


### 场景编排

**目标：**
把数据源、数据质量、特征、算法、规则、告警、人工确认和评估串成可执行DAG，而不是简单页面连线。

**前置条件：**
场景表、算法表、数据源表已存在；算法可注册；数据可查询。

**具体操作：**
1. 定义节点类型。
2. 保存场景节点JSON。
3. 校验DAG是否有环。
4. 按依赖顺序执行节点。
5. 保存节点状态和trace_id。
6. 失败按策略重试。
7. 人工确认节点可暂停和恢复。

**推荐技术：**
PostgreSQL JSONB、Python DAG执行器、Celery、WebSocket。

**参考代码：**
本步骤涉及的SQL、Python、FastAPI、Angular或配置示例见本章下方代码块；如果本步骤不直接写代码，则提交对应的配置、表格、页面设计或验收清单。

**输入：**
scenario_definition、scenario_flow_node、scenario_data_source、scenario_algorithm。

**输出：**
场景配置、节点状态、运行日志、预测/异常/告警结果。

**验收方法：**
测试场景可按DAG顺序运行；失败节点能重试；人工确认节点能暂停；trace_id贯穿全流程。

**常见问题：**
节点依赖形成环；节点编码重复；算法版本不存在；参数缺失；人工确认后无法恢复。

**下一步：**
进入案例1和案例2开发。


节点JSON：

```json
{
  "node_code": "forecast_node",
  "node_type": "algorithm",
  "algorithm_version_id": 12,
  "upstream_nodes": ["quality_node"],
  "params": {
    "horizon": 96
  },
  "retry_policy": {
    "max_retries": 3
  }
}
```

节点类型：

| 类型 | 用途 |
|---|---|
| start | 场景开始 |
| data_source | 读取数据源 |
| data_quality | 数据质量分析 |
| preprocess | 数据预处理 |
| feature | 特征工程 |
| algorithm | 调用算法 |
| rule | 规则判断 |
| result | 保存结果 |
| alarm | 生成告警 |
| manual_confirm | 等待人工确认 |
| evaluation | 效果评估 |
| end | 场景结束 |

执行引擎伪代码：

```python
def run_scenario(scenario_id: int, trace_id: str):
    nodes = load_nodes(scenario_id)
    validate_dag(nodes)
    ordered_nodes = topological_sort(nodes)
    context = {"trace_id": trace_id}

    for node in ordered_nodes:
        if not upstream_success(node, context):
            mark_skipped(node)
            continue
        try:
            mark_running(node)
            if node.node_type == "data_source":
                result = run_data_source(node, context)
            elif node.node_type == "data_quality":
                result = run_quality(node, context)
            elif node.node_type == "algorithm":
                result = run_algorithm(node, context)
            elif node.node_type == "manual_confirm":
                mark_waiting(node)
                return {"status": "waiting_manual_confirm"}
            else:
                result = run_builtin_node(node, context)
            context[node.node_code] = result
            mark_success(node)
        except Exception as exc:
            if can_retry(node):
                retry_node(node)
            else:
                mark_failed(node, str(exc))
                raise
    return {"status": "success", "trace_id": trace_id}
```


# 12. Angular前端工程设计


### Angular前端工程设计

**目标：**
搭建可扩展的前端工程，支持登录、动态菜单、数据源、质量分析、算法管理、场景编排、案例页面和系统管理。

**前置条件：**
Angular工程已创建；后端API基础路径已配置；UI组件库已安装。

**具体操作：**
1. 建立core/shared/features目录。
2. 配置路由和登录守卫。
3. 建立统一API服务。
4. 建立图表组件。
5. 按页面模块开发feature。
6. 处理加载、空数据、错误、权限状态。

**推荐技术：**
Angular、TypeScript、Angular Router、Angular Material、ECharts、ngx-echarts、WebSocket。

**参考代码：**
本步骤涉及的SQL、Python、FastAPI、Angular或配置示例见本章下方代码块；如果本步骤不直接写代码，则提交对应的配置、表格、页面设计或验收清单。

**输入：**
后端OpenAPI、页面清单、权限点、接口返回JSON。

**输出：**
可运行前端工程、登录页、动态菜单、核心页面、图表组件。

**验收方法：**
ng serve启动成功；登录后看到菜单；数据源列表可调用后端；图表能展示series。

**常见问题：**
跨域错误；JWT失效；接口字段不一致；ECharts容器高度为0；路由守卫循环跳转。

**下一步：**
进入具体页面开发和前后端联调。


## 12.1 Angular目录结构

```text
src/app/
├─ core/
│  ├─ auth/
│  ├─ guards/
│  ├─ interceptors/
│  ├─ layout/
│  └─ services/
├─ shared/
│  ├─ components/
│  ├─ charts/
│  ├─ models/
│  └─ pipes/
├─ features/
│  ├─ dashboard/
│  ├─ data-source/
│  ├─ data-quality/
│  ├─ algorithm/
│  ├─ scenario/
│  ├─ leakage/
│  ├─ waterlogging/
│  └─ system/
└─ app.routes.ts
```

## 12.2 页面设计统一模板

每个页面必须按以下字段写设计说明：

| 字段 | 内容 |
|---|---|
| 页面名称 | 中文名称 |
| 页面路径 | Angular路由 |
| 用户角色 | 谁使用 |
| 页面目标 | 解决什么问题 |
| 顶部筛选条件 | 时间、点位、场景、状态等 |
| 主要区域 | 页面布局 |
| 使用的表格 | 表格列 |
| 使用的图表 | ECharts类型 |
| 操作按钮 | 新增、运行、导出等 |
| 后端接口 | API路径 |
| 页面状态 | 正常、空、加载、错误 |
| 权限要求 | view/run/config/dispose |

## 12.3 数据源管理页面

布局：

```text
顶部按钮：新增数据源 | 测试连接 | 启用 | 停用 | 刷新
中间表格：名称 | 类型 | 地址 | 状态 | 最近同步时间 | 最近同步结果 | 操作
右侧/弹窗：新增或编辑数据源表单
```

表单字段：

- 名称；
- 类型；
- 主机；
- 端口；
- 用户名；
- 密码；
- 数据库名；
- 接口地址；
- 鉴权方式；
- 采集周期。

Angular Service示例：

```ts
@Injectable({ providedIn: 'root' })
export class DataSourceService {
  private baseUrl = `${environment.apiBaseUrl}/data-sources`;

  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<ApiResponse<DataSource[]>>(this.baseUrl);
  }

  create(payload: CreateDataSourceRequest) {
    return this.http.post<ApiResponse<DataSource>>(this.baseUrl, payload);
  }
}
```

## 12.4 数据质量页面

页面包括：

- 数据集选择；
- 时间范围；
- 点位选择；
- 质量评分卡；
- 缺失率热力图；
- 异常点曲线；
- 采样频率分布；
- 字段问题表；
- 导出报告按钮。

## 12.5 算法管理页面

页面包括：

- 算法分类树；
- 算法卡片；
- 算法详情；
- 版本列表；
- 参数配置；
- 输入输出字段；
- 模型文件；
- 测试运行；
- 发布；
- 下线；
- 回滚。

## 12.6 场景编排页面

```text
左侧：节点工具箱
中间：流程画布
右侧：节点配置面板
顶部：保存 | 校验 | 测试运行 | 发布 | 查看日志
```

## 12.7 案例1页面

顶部筛选：分区、DMA、小区、点位、时间范围。

第一行指标卡：总供水量、总用水量、漏损率、高风险分区数、未处理告警数、模型评分。

第二行：左侧管网拓扑图；右侧压力和流量实时曲线。

第三行：左侧夜间最小流量；右侧实际值、预测值和置信区间。

第四行：左侧异常点和异常分数；右侧漏损候选点排名和根因分析。

底部：告警处置时间轴和模型指标。

接口示例：

```http
GET /api/v1/scenarios/S01_LEAKAGE/overview
GET /api/v1/timeseries/query
GET /api/v1/results/predictions?scenario_code=S01_LEAKAGE
GET /api/v1/results/anomalies?scenario_code=S01_LEAKAGE
GET /api/v1/alarms?scenario_code=S01_LEAKAGE
```

## 12.8 案例2页面

页面包括：

- 区域选择；
- 降雨过程；
- 风险地图；
- 降雨、水位、流量联动曲线；
- 泵站状态；
- 风险等级；
- 调度建议；
- 告警处置；
- 事后评估。

# 13. 前端页面设计


### 前端页面设计

**目标：**
把每个页面拆成目标、角色、筛选、图表、接口、状态和权限，保证学生知道页面做什么。

**前置条件：**
Angular基础工程、动态菜单、API服务已完成。

**具体操作：**
1. 按页面模板编写设计。
2. 先实现数据源、质量、算法、场景四类管理页。
3. 再实现案例1和案例2业务页。
4. 所有页面处理加载、空数据、错误状态。
5. 所有操作按钮绑定权限。

**推荐技术：**
Angular、Angular Material、ECharts、ngx-echarts、Router Guard。

**参考代码：**
本步骤涉及的SQL、Python、FastAPI、Angular或配置示例见本章下方代码块；如果本步骤不直接写代码，则提交对应的配置、表格、页面设计或验收清单。

**输入：**
页面清单、后端接口、权限点。

**输出：**
页面组件、服务、路由、图表配置、状态处理。

**验收方法：**
页面可打开；接口可调用；空数据和错误状态可见；无权限按钮隐藏或禁用。

**常见问题：**
页面只做静态；图表无高度；接口字段不匹配；没有错误提示。

**下一步：**
进入案例1/2完整开发。


# 14. 案例1完整开发


### 案例1：供水管网漏损控制与评定

**目标：**
完成从漏损相关数据接入、质量分析、算法运行、告警生成到前端展示的闭环。

**前置条件：**
数据接入、质量分析、算法接口、场景编排、前端基础页面已完成。

**具体操作：**
1. 导入压力/流量、远传表、机械表、分区、拓扑数据。
2. 建立字段映射。
3. 生成质量分析和Qscore。
4. 执行可信补全、夜间最小流量、水平衡、预测、异常检测。
5. 保存预测、异常、告警和评估结果。
6. 前端展示和告警处置。

**推荐技术：**
Pandas、TimescaleDB、FastAPI、Celery、ECharts、场景DAG。

**参考代码：**
本步骤涉及的SQL、Python、FastAPI、Angular或配置示例见本章下方代码块；如果本步骤不直接写代码，则提交对应的配置、表格、页面设计或验收清单。

**输入：**
压力数据、流量数据、远传表累计水量、机械表月度抄表、小区与DMA映射、分区数据、管网拓扑、设备台账、告警与工单。

**输出：**
漏损率、分区风险等级、候选漏损点、总分表差异、夜间最小流量、预测曲线、异常分数、告警事件、处置建议、模型评估结果。

**验收方法：**
案例1页面能选择分区和时间；曲线有数据；能运行分析任务；能生成告警；能确认和关闭告警；结果能追溯到任务和算法版本。

**常见问题：**
总分表关系不清；DMA映射缺失；负流量被误删；夜间合法用水量未确认。所有业务规则不确定处标记待业务确认。

**下一步：**
进入案例2开发和联调。


# 15. 案例2完整开发


### 案例2：城市内涝预警报警与指挥调度

**目标：**
完成内涝数据接入、预测、风险判断、调度建议、告警发布和事后评估闭环。若真实数据暂缺，先用模拟数据跑通流程。

**前置条件：**
场景编排可运行；算法接口可调用；前端案例2页面框架完成。

**具体操作：**
1. 接入或模拟气象、雨量、水位、流量、泵站、阀门、SimuWater数据。
2. 做事件对齐和质量分析。
3. 运行水位/流量预测和内涝概率预测。
4. 调用或模拟SimuWater情景推演。
5. 生成风险等级、调度建议和告警。
6. 前端展示风险地图、联动曲线和处置结果。

**推荐技术：**
FastAPI、Celery、Pandas、概率预测算法、ECharts地图/曲线、SimuWater接口适配。

**参考代码：**
本步骤涉及的SQL、Python、FastAPI、Angular或配置示例见本章下方代码块；如果本步骤不直接写代码，则提交对应的配置、表格、页面设计或验收清单。

**输入：**
气象预报、雷达降雨、雨量站数据、管网水位、管网流量、积水点液位、泵站状态、阀门状态、工单事件、SimuWater模型、应急预案。

**输出：**
未来降雨量、未来水位、未来流量、积水深度、预测区间、超阈值概率、风险等级、风险区域、泵闸联动建议、应急处置建议、预警提前量、事后评估结果。

**验收方法：**
案例2页面能展示模拟或真实数据；能运行预测任务；能生成风险等级和告警；能记录处置和事后评估。

**常见问题：**
真实数据缺失；泵闸规则不明确；SimuWater接口未提供；预案阈值待确认。用模拟器跑平台闭环，同时标注待业务补充。

**下一步：**
预留其他10个场景。


# 16. 其余10个场景预留


### 其余10个场景预留

**目标：**
只做数据库、接口、菜单、路由和页面模板预留，不开发全部业务算法。

**前置条件：**
场景管理模块可用；前端动态菜单可用。

**具体操作：**
1. 在scenario_definition插入10个场景。
2. 创建菜单和路由。
3. 创建参数配置模板。
4. 创建数据源绑定和算法绑定接口。
5. 创建结果展示模板。
6. 配置权限和调度占位。

**推荐技术：**
PostgreSQL、FastAPI、Angular Router、动态表单。

**参考代码：**
本步骤涉及的SQL、Python、FastAPI、Angular或配置示例见本章下方代码块；如果本步骤不直接写代码，则提交对应的配置、表格、页面设计或验收清单。

**输入：**
12场景清单、菜单配置、权限点。

**输出：**
10个场景入口、模板页、配置记录、接口占位。

**验收方法：**
登录后能看到10个场景入口；点击进入模板页；可保存参数配置；接口返回“待接入”。

**常见问题：**
误把预留场景做成完整开发；没有权限控制；页面写死不可扩展。

**下一步：**
进入前后端联调。


# 17. 前后端联调


### 前后端联调

**目标：**
用统一接口格式打通前端页面和后端服务，保证字段、状态、错误码一致。

**前置条件：**
后端Swagger可访问；前端工程可启动；至少一个数据源和一条时序数据存在。

**具体操作：**
1. 先联调登录。
2. 联调数据源列表。
3. 联调历史数据查询。
4. 联调质量分析任务。
5. 联调算法任务。
6. 联调案例页面。
7. 统一错误处理。

**推荐技术：**
Postman/Apifox、Angular HttpClient、FastAPI Swagger、ECharts。

**参考代码：**
本步骤涉及的SQL、Python、FastAPI、Angular或配置示例见本章下方代码块；如果本步骤不直接写代码，则提交对应的配置、表格、页面设计或验收清单。

**输入：**
接口文档、测试账号、测试数据。

**输出：**
联调记录、接口问题清单、修复后的前后端代码。

**验收方法：**
主要页面无接口报错；错误提示清楚；ECharts正常显示；JWT和跨域正常。

**常见问题：**
CORS错误；字段名不一致；时间格式不一致；分页格式不一致；后端返回null导致前端报错。

**下一步：**
进入测试和部署。


历史数据查询示例：

```http
GET /api/v1/timeseries/query
```

参数：

```json
{
  "point_id": 1001,
  "metric_code": "flow",
  "start_time": "2026-07-01T00:00:00+08:00",
  "end_time": "2026-07-02T00:00:00+08:00",
  "interval": "15min"
}
```

返回：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "point_id": 1001,
    "metric_code": "flow",
    "unit": "m3/h",
    "series": [
      {
        "time": "2026-07-01T00:00:00+08:00",
        "value": 8.2,
        "quality_flag": "normal"
      }
    ]
  },
  "trace_id": "uuid"
}
```

Angular转换为ECharts：

```ts
this.timeseriesService.query(params).subscribe(resp => {
  const series = resp.data.series.map(p => [p.time, p.value]);
  this.chartOption = {
    xAxis: { type: 'time' },
    yAxis: { type: 'value', name: resp.data.unit },
    series: [{ type: 'line', data: series, showSymbol: false }]
  };
});
```


# 18. 测试


### 测试

**目标：**
覆盖单元、接口、数据、算法、前端、权限、性能、异常和场景闭环，保证学生提交成果可验收。

**前置条件：**
核心功能已开发；测试数据库和测试数据已准备。

**具体操作：**
1. 编写测试用例。
2. 执行后端单元测试。
3. 执行接口测试。
4. 执行前端组件测试。
5. 执行数据导入和算法测试。
6. 执行案例闭环测试。
7. 输出测试报告。

**推荐技术：**
pytest、httpx、Postman/Apifox、Angular TestBed、浏览器开发者工具。

**参考代码：**
本步骤涉及的SQL、Python、FastAPI、Angular或配置示例见本章下方代码块；如果本步骤不直接写代码，则提交对应的配置、表格、页面设计或验收清单。

**输入：**
测试数据、测试账号、接口文档、验收标准。

**输出：**
测试用例、测试报告、缺陷清单、修复记录。

**验收方法：**
关键测试全部通过；严重缺陷为0；案例1/2闭环通过。

**常见问题：**
只测正常流程；测试库污染开发库；测试数据不可复现；缺少异常用例。

**下一步：**
进入部署。


测试类型：

| 类型 | 示例 |
|---|---|
| 单元测试 | 字段映射、Qscore、算法predict |
| 接口测试 | 数据源CRUD、历史数据查询、任务创建 |
| 数据测试 | Excel导入、重复导入、无效时间 |
| 算法测试 | 移动平均预测、Isolation Forest异常 |
| 前端组件测试 | 数据源表格、时序曲线 |
| 权限测试 | 普通用户不能发布模型 |
| 性能测试 | 10万行导入、时序查询 |
| 异常测试 | 数据库断开、Redis断开 |
| 场景闭环测试 | 案例1/案例2从运行到告警处置 |

数据导入测试用例：

| 用例 | 输入 | 预期 |
|---|---|---|
| 正常文件 | 字段完整Excel | success，写入ts_measurement |
| 空文件 | 无数据Excel | failed，提示文件为空 |
| 时间错误 | time无法解析 | partial_success或failed，输出错误报告 |
| 缺少流量字段 | 无flow映射 | failed，提示字段映射不完整 |
| 重复导入 | 同一文件同一批次 | 提示重复或幂等跳过 |
| 数据库不可用 | 停止PostgreSQL | failed，记录连接错误 |
| 导入中断 | Worker停止 | 任务保持可重试状态 |

# 19. 部署


### 部署

**目标：**
把后端、前端、数据库、中间件部署到开发/测试/生产环境，并保证可监控、可备份、可恢复。

**前置条件：**
测试通过；Docker镜像或部署包已准备；服务器端口和账号已确认。

**具体操作：**
1. 准备.env.prod。
2. 构建前端静态文件。
3. 启动后端服务。
4. 启动Celery worker和scheduler。
5. 配置Nginx反向代理。
6. 配置数据库和MinIO备份。
7. 配置服务监控。

**推荐技术：**
Docker、Nginx、Linux、PostgreSQL、Redis、RabbitMQ、MinIO、Prometheus可选。

**参考代码：**
本步骤涉及的SQL、Python、FastAPI、Angular或配置示例见本章下方代码块；如果本步骤不直接写代码，则提交对应的配置、表格、页面设计或验收清单。

**输入：**
部署包、数据库迁移、环境变量、服务器资源。

**输出：**
可访问的系统地址、部署文档、备份策略、监控页面。

**验收方法：**
前端可访问；API健康检查正常；Celery任务可执行；数据库备份可恢复。

**常见问题：**
生产环境使用DEBUG=true；忘记执行迁移；Nginx WebSocket未配置Upgrade；MinIO桶不存在。

**下一步：**
进入阶段验收。


Nginx示例：

```nginx
server {
    listen 80;
    server_name smart-water.local;

    root /opt/smart-water/frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /ws/ {
        proxy_pass http://127.0.0.1:8000/ws/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```


# 20. 学生任务分工

| 学生 | 任务 | 需要建立的文件 | 需要实现的接口 | 依赖 | 验收方法 | 禁止修改 |
|---|---|---|---|---|---|---|
| 学生A：数据库与ORM | 建库、建表、ORM、Alembic | models、migrations | 无或健康检查 | 架构设计 | 迁移成功，表和索引存在 | 不得随意改表名字段名 |
| 学生B：数据扫描与导入 | 扫描脚本、导入任务、入库 | tools、services/ingest | /data-sources、/ingest/tasks | 学生A | Excel可入库 | 不得修改原始目录 |
| 学生C：数据质量分析 | 缺失/异常/Qscore | services/quality | /data-quality/tasks | 学生B | 质量报告可展示 | 不得删除真实异常 |
| 学生D：算法注册与任务执行 | 算法基类、注册、训练推理任务 | algorithms、services/algorithm | /algorithms、/training/tasks | 学生A/C | 算法可注册运行 | 不得硬编码算法版本 |
| 学生E：场景管理与编排 | 场景表、节点DAG、运行引擎 | services/scenario | /scenarios | 学生D | 场景可运行 | 不得把流程写死在页面 |
| 学生F：Angular基础平台 | 登录、菜单、布局、API服务 | core、shared | 调用auth/menu接口 | 后端基础 | 前端可启动登录 | 不得写死API地址 |
| 学生G：案例1页面 | 漏损页面和图表 | features/leakage | leakage相关接口 | 学生B/C/D/E/F | 案例1闭环可演示 | 不得改公共图表组件接口 |
| 学生H：案例2页面 | 内涝页面和图表 | features/waterlogging | waterlogging相关接口 | 学生D/E/F | 案例2闭环可演示 | 不得写死模拟数据为正式数据 |
| 学生I：测试与部署 | 测试用例、部署脚本 | tests、deploy | 健康检查 | 全体 | 测试报告和部署成功 | 不得改业务逻辑绕过测试 |

# 21. 阶段验收标准

## 数据库阶段

1. PostgreSQL可连接。
2. TimescaleDB扩展启用。
3. Alembic迁移成功。
4. 基础表创建完成。
5. 外键和索引存在。
6. 可以写入一条监测数据。
7. 可以查询点位一天数据。
8. 原始值和处理值均保留。

## 后端阶段

1. FastAPI正常启动。
2. Swagger可访问。
3. 登录接口正常。
4. 数据源CRUD正常。
5. 文件导入任务正常。
6. Celery任务正常。
7. WebSocket可推送任务进度。
8. 异常返回格式统一。

## 前端阶段

1. Angular可正常启动。
2. 登录页完成。
3. 动态菜单完成。
4. 数据源页面完成。
5. 时序曲线可显示。
6. 数据质量页面可显示。
7. 算法管理页面可操作。
8. 案例1页面形成完整闭环。

## 案例闭环阶段

1. 案例1能从数据导入运行到告警处置。
2. 案例2能使用真实或模拟数据运行到风险预警。
3. 所有结果能追溯到任务、算法版本和原始数据窗口。
4. 待业务确认内容已明确标注。

# 22. 常见问题与排查方法

| 问题 | 典型报错 | 可能原因 | 检查步骤 | 解决方法 |
|---|---|---|---|---|
| PostgreSQL连接失败 | connection refused | 数据库未启动、端口错、密码错 | docker ps；检查.env；DBeaver连接 | 启动容器，修正DATABASE_URL |
| TimescaleDB未安装 | extension timescaledb not available | 镜像不是TimescaleDB | SELECT * FROM pg_extension | 使用timescale/timescaledb镜像 |
| Alembic迁移失败 | target database is not up to date | 多人迁移冲突 | alembic history/current | 合并迁移，重新upgrade |
| Excel读取乱码 | 字段名乱码 | 控制台编码或文件格式问题 | 用Python读取repr；确认xlsx不是csv | xlsx用openpyxl；csv指定encoding |
| 时间字段解析失败 | NaT过多 | 格式混乱、列选错 | 输出无效时间行 | 增加格式规则，错误行进报告 |
| 大文件导入内存溢出 | MemoryError | 一次性读全量 | 查看文件行数和内存 | 分块读取，批量写入 |
| Celery任务不执行 | task pending | Worker未启动、broker错 | celery inspect ping | 启动worker，修正RabbitMQ地址 |
| Redis连接失败 | ConnectionError | Redis未启动或DB错 | redis-cli ping | 启动Redis，检查REDIS_URL |
| RabbitMQ队列积压 | 队列消息很多 | Worker不足或任务卡住 | 管理台15672 | 增加worker，排查慢任务 |
| MinIO上传失败 | bucket not found | 桶未创建、账号错 | 登录9001控制台 | 创建bucket，修正密钥 |
| 算法字段不匹配 | ALG_400_SCHEMA_MISMATCH | 字段映射缺失 | 查看algorithm_io_definition | 修改映射配置，不改算法代码 |
| 模型文件找不到 | ALG_404_MODEL_NOT_FOUND | MinIO文件丢失或URI错 | 查model_file表和MinIO | 重新上传模型或回滚版本 |
| Angular跨域错误 | CORS blocked | 后端未配置CORS | 浏览器Network | FastAPI加入CORSMiddleware |
| JWT失效 | 401 Unauthorized | token过期 | 查看localStorage | 重新登录或刷新token |
| WebSocket断开 | close 1006 | Nginx未配置Upgrade | 浏览器Console、Nginx日志 | 配置proxy_set_header Upgrade |
| ECharts无数据 | 空白图表 | 容器高度0或series为空 | 检查DOM和接口返回 | 设置高度，处理空状态 |
| 接口字段与前端模型不一致 | undefined | 后端字段改名 | 对照OpenAPI和TS模型 | 更新统一接口模型 |


# 附录：必须遵守的开发原则

1. 禁止在代码中写死字段名称、算法版本和场景流程。
2. 原始数据目录只能读取，所有结果写入独立输出目录或数据库。
3. 对水务业务不确定的部分统一标注“待业务确认”。
4. 优先完成平台通用能力，再完成案例1和案例2。
5. 其余10个场景只预留数据库、接口、菜单、路由和页面模板。
6. 每个结果必须能追溯到原始数据、任务实例、算法版本和参数快照。
