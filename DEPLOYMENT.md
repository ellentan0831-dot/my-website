# 部署指南 - Vercel全栈部署

## 前置准备

1. 注册账号：
   - [GitHub](https://github.com/) - 用于代码托管
   - [Vercel](https://vercel.com/) - 用于部署

2. 安装Git（如果还没有）：
   - 下载：https://git-scm.com/downloads
   - 安装时保持默认选项

## 部署步骤

### 第一步：创建GitHub仓库并上传代码

1. 在GitHub上创建新仓库（命名为 `my-website` 或其他名称）
2. 在项目目录打开终端，执行以下命令：

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/你的用户名/仓库名.git
git push -u origin main
```

### 第二步：部署到Vercel

1. 登录 [Vercel](https://vercel.com/)
2. 点击 "Add New Project"
3. 选择刚才创建的GitHub仓库
4. 配置项目：
   - Framework Preset: Other
   - Root Directory: `./`
   - Build Command: 留空
   - Output Directory: `./`
5. 点击 "Deploy"

### 第三步：配置环境变量（如果需要）

在Vercel项目设置中添加环境变量：
- `PORT`: 3000

### 第四步：获取部署后的URL

部署完成后，Vercel会提供一个URL，例如：
```
https://my-website.vercel.app
```

## 修改API地址

部署成功后，需要修改前端代码中的API地址：

### 修改 market-dynamics.js

将：
```javascript
const API_BASE_URL = 'http://localhost:3000/api';
```

改为：
```javascript
const API_BASE_URL = 'https://你的项目名.vercel.app/api';
```

### 重新部署

修改完成后，提交代码并推送，Vercel会自动重新部署。

## 后端API说明

您的后端API已经配置为Serverless Function，会在Vercel上自动运行。

API端点：
- `GET /api/news` - 获取所有新闻
- `GET /api/news/daily` - 获取每日总结
- `GET /api/news/weekly` - 获取七日新闻
- `POST /api/news/update` - 手动更新新闻

## 注意事项

1. **免费额度**：Vercel免费版每月100GB流量，足够个人网站使用
2. **自动更新**：定时任务在Serverless环境中可能受限，建议使用外部Cron服务（如cron-job.org）定期调用 `/api/news/update`
3. **图片资源**：确保所有图片文件都已提交到Git仓库

## 故障排查

### API请求失败
- 检查Vercel部署日志
- 确认API地址正确
- 查看浏览器控制台错误信息

### 定时任务不执行
- Serverless环境不支持node-cron
- 使用外部Cron服务定期触发更新

## 域名绑定（可选）

如果需要自定义域名：
1. 在Vercel项目设置中添加域名
2. 按照提示配置DNS记录
3. 等待DNS生效

## 更新网站

修改代码后：
```bash
git add .
git commit -m "Update website"
git push
```

Vercel会自动检测并重新部署。

## 需要帮助？

- Vercel文档：https://vercel.com/docs
- GitHub文档：https://docs.github.com
