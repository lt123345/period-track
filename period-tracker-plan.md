# Period Tracker - 超低成本大姨妈记录工具

## 技术栈

| 组件 | 方案 | 费用 |
|------|------|------|
| UI & 数据管理 | Keystatic + Next.js | 免费 |
| 数据存储 | Git repo (markdown/JSON) | 免费 |
| 部署 | Vercel | 免费 |
| 定时任务 | GitHub Actions cron (每天一次) | 免费 |
| 推送通知 | ntfy.sh → iPhone ntfy app | 免费 |

**总成本：0**

## 功能

- 记录每次经期开始日期
- 修改历史记录
- 基于历史周期预测下一次日期
- 临近时 iPhone 推送通知

## 架构

```
┌─────────────┐     ┌──────────────┐     ┌──────────┐
│  Keystatic  │────▶│  Git Repo    │◀────│  GitHub  │
│  (编辑 UI)  │     │  (数据存储)   │     │  Actions │
└─────────────┘     └──────────────┘     └────┬─────┘
       │                                      │
       ▼                                      ▼
┌─────────────┐                        ┌──────────┐
│   Vercel    │                        │ ntfy.sh  │
│   (部署)    │                        │  (推送)   │
└─────────────┘                        └────┬─────┘
                                            │
                                            ▼
                                     ┌──────────┐
                                     │  iPhone   │
                                     │ ntfy app  │
                                     └──────────┘
```

## 实现步骤

### 1. Next.js + Keystatic 项目

- 初始化 Next.js 项目
- 集成 Keystatic，定义 schema：每条记录包含 `date` 和可选的 `notes`
- 数据以 markdown/YAML 形式存在 repo 的 `content/periods/` 目录下

### 2. 预测 API

- 路由：`/api/prediction`
- 读取所有记录，计算平均周期长度
- 返回预测下次日期和距今天数

### 3. GitHub Actions 通知

```yaml
# .github/workflows/notify.yml
name: Period Reminder
on:
  schedule:
    - cron: '0 8 * * *'  # 每天 UTC 8:00（北京时间 16:00）

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - name: Check and notify
        env:
          NTFY_TOPIC: ${{ secrets.NTFY_TOPIC }}
          SITE_URL: ${{ secrets.SITE_URL }}
        run: |
          DAYS=$(curl -s "$SITE_URL/api/prediction" | jq '.daysUntil')
          if [ "$DAYS" -le 3 ] && [ "$DAYS" -ge 0 ]; then
            curl -d "预计 ${DAYS} 天后来大姨妈" ntfy.sh/$NTFY_TOPIC
          fi
```

### 4. ntfy.sh 配置

- iPhone 安装 ntfy app
- 订阅 topic（和 GitHub secret `NTFY_TOPIC` 相同的随机字符串）
- Topic name 是唯一的"密码"，不要提交到代码里

### 5. GitHub Secrets 设置

| Secret | 值 |
|--------|----|
| `NTFY_TOPIC` | 随机字符串，如 `period-xxxxx-yyyyy` |
| `SITE_URL` | Vercel 部署地址，如 `https://xxx.vercel.app` |
