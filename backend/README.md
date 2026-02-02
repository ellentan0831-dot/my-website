# AI News Backend Service

自动抓取和更新AI新闻的后端服务，支持定时任务和API接口。

## 功能特性

- 自动抓取多个AI新闻源的最新资讯
- 每日自动更新新闻（默认每天上午8点）
- 提供RESTful API接口供前端调用
- 支持新闻来源筛选
- 数据持久化存储

## 安装步骤

1. 进入backend目录：
```bash
cd backend
```

2. 安装依赖：
```bash
npm install
```

## 运行服务

### 开发模式（自动重启）
```bash
npm run dev
```

### 生产模式
```bash
npm start
```

服务将在 `http://localhost:3000` 启动。

## API接口

### 获取所有新闻
```
GET /api/news
```

### 获取每日总结
```
GET /api/news/daily
```

### 获取七日内新闻
```
GET /api/news/weekly
```

### 按来源筛选新闻
```
GET /api/news/weekly?source=openai
```

支持的来源：`openai`, `anthropic`, `coze`, `dify`, `langchain`, `jiqizhixin`, `36kr`, `qbitai`, `latepost`

### 手动更新新闻
```
POST /api/news/update
Content-Type: application/json

{
  "dailySummary": [...],
  "weeklyNews": [...]
}
```

### 健康检查
```
GET /api/health
```

## 定时任务

服务启动后会自动设置定时任务，每天上午8点自动更新新闻。

首次启动时会立即执行一次新闻更新。

## 新闻源配置

在 `news-fetcher.js` 中可以配置要抓取的新闻源：

```javascript
const newsSources = [
    {
        name: 'openai',
        displayName: 'OPENAI',
        urls: ['https://openai.com/blog']
    },
    // 添加更多新闻源...
];
```

## 数据存储

新闻数据存储在 `backend/news-data.json` 文件中，格式如下：

```json
{
  "dailySummary": [
    "· OpenAI 计划 2026 年第四季度 IPO：据华尔街日报报道..."
  ],
  "weeklyNews": [
    {
      "title": "新闻标题",
      "summary": "新闻摘要",
      "link": "https://...",
      "source": "openai",
      "date": "2026-02-03"
    }
  ],
  "lastUpdated": "2026-02-03T08:00:00.000Z"
}
```

## 注意事项

1. 确保Node.js版本 >= 14
2. 某些网站可能有反爬虫机制，需要适当调整请求头或添加代理
3. 如果网络抓取失败，系统会使用示例数据作为后备
4. 定时任务时间可以在 `server.js` 中修改cron表达式

## 故障排查

### 新闻抓取失败
- 检查网络连接
- 查看控制台错误日志
- 确认目标网站是否可访问

### API无法访问
- 确认后端服务已启动
- 检查端口3000是否被占用
- 查看防火墙设置

### 定时任务不执行
- 确认服务持续运行
- 检查系统时间设置
- 查看cron表达式是否正确
