# 电商物流配送可视化平台

> 25字节跳动工程训练营课题项目

## 部署 & 使用

1. 在本地部署Postgres，并创建数据库，名称为`visual_logistics`

2. 下载源代码

```
git clone https://github.com/NriotHrreion/bytedance-visual-logistics.git
```

3. 重命名`.env.example`为`.env`，并填写高德地图API密钥及数据库连接信息

```conf
# 高德地图API Key
NEXT_PUBLIC_AMAP_API_KEY=
# 高德地图服务 Key
NEXT_PUBLIC_AMAP_SERVICE_KEY=
# 高德地图API Secret
AMAP_API_SECRET=

# 后端端口 (无需修改)
BACKEND_PORT=3010
# 数据库用户名
PGUSER=postgres
# 数据库密码
PGPASSWORD=
# 数据库地址
PGHOST=localhost
# 数据库端口
PGPORT=5432
# 数据库名称
PGDATABASE=visual_logistics
```

4. 安装项目依赖

```
pnpm i
```

5. 启动项目

```
pnpm dev
```

6. 打开`http://localhost:3000`即可开始使用
