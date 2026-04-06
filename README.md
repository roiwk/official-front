# 前端项目

这是一个前后端分离的前端项目，使用 Vue 3 + Vite 构建。

## 项目结构

```
frontend/
├── src/
│   ├── api/          # API服务
│   ├── views/        # 页面组件
│   ├── router/       # 路由配置
│   ├── utils/        # 工具函数
│   ├── App.vue       # 根组件
│   └── main.js       # 入口文件
├── index.html
├── package.json
└── vite.config.js
```


## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 环境变量

复制 `.env.example` 为 `.env.local` 进行本地配置：

```bash
cp .env.example .env.local
```

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `VITE_APP_TITLE` | 应用标题 | 平台 |
| `VITE_APP_URL` | 前端地址 | http://localhost:3000 |
| `VITE_API_BASE_URL` | 后端 API 地址 | 留空（开发环境走 vite proxy） |
| `VITE_DEV_PROXY_TARGET` | 开发代理目标地址 | http://127.0.0.1:8080 |


## 注意事项

- 所有API接口已改为返回JSON格式
- Token验证通过URL参数传递
