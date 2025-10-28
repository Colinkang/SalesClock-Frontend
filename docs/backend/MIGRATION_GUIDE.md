# 数据库迁移指南

## 📁 迁移文件位置

```
backend/prisma/migrations/
└── 20251028065253_init/
    └── migration.sql
```

## 🚀 如何使用迁移

### 1. 创建数据库

首先确保 PostgreSQL 数据库已创建：

```bash
# 使用 psql 连接 PostgreSQL
psql -U postgres

# 创建数据库
CREATE DATABASE visitdb;

# 退出
\q
```

### 2. 配置环境变量

在 `backend/.env` 文件中配置数据库连接：

```env
DATABASE_URL="postgresql://username:password@localhost:5432/visitdb?schema=public"
```

### 3. 运行迁移

有三种方式运行迁移：

#### 方式 A: 开发环境（推荐）

```bash
cd backend
npm run prisma:migrate
# 或
npx prisma migrate dev
```

这会：
- 应用所有待执行的迁移
- 重新生成 Prisma Client
- 更新数据库 schema

#### 方式 B: 生产环境

```bash
cd backend
npx prisma migrate deploy
```

这只会：
- 应用迁移，**不会**重新生成 Client
- 适用于生产环境

#### 方式 C: 手动执行 SQL

如果不想使用 Prisma Migrate，可以直接执行 SQL 文件：

```bash
psql -U postgres -d visitdb -f backend/prisma/migrations/20251028065253_init/migration.sql
```

## 📊 迁移文件内容

### 创建的表

1. **users** - 用户表
   - 存储用户基本信息
   - 包含邮箱、密码（加密）、姓名、角色

2. **invitations** - 邀请表
   - 存储邀请链接
   - 关联邀请人
   - 包含过期时间

3. **customers** - 客户表
   - 存储客户信息
   - 包含地址、坐标等
   - 关联创建人

4. **visit_plans** - 拜访计划表
   - 存储拜访计划
   - 包含签到信息
   - 支持状态管理

5. **visit_reports** - 拜访报告表
   - 存储拜访报告详情
   - 包含沟通要点、反馈等
   - 支持附件存储

6. **articles** - 文章表
   - 存储文章内容
   - 关联创建人

### 创建的枚举类型

1. **Role** - 用户角色
   - `ADMIN` - 管理员
   - `MANAGER` - 经理
   - `USER` - 普通用户

2. **VisitStatus** - 拜访状态
   - `PENDING` - 待签到
   - `CHECKED_IN` - 已签到
   - `COMPLETED` - 已完成
   - `CANCELLED` - 已取消

### 索引

迁移文件为以下字段创建了索引以优化查询性能：

- `users.email` (唯一索引)
- `invitations.token` (唯一索引)
- `invitations.email`
- `invitations.accepted_at`
- `customers.created_by`
- `visit_plans.customer_id`
- `visit_plans.planned_date`
- `visit_plans.status`
- `visit_plans.created_by`
- `visit_reports.visit_plan_id`
- `visit_reports.customer_id`
- `articles.created_at`
- `articles.created_by`

### 外键约束

所有外键都使用 `ON DELETE CASCADE`，确保数据一致性：

- `invitations.invited_by` → `users.id`
- `customers.created_by` → `users.id`
- `visit_plans.customer_id` → `customers.id`
- `visit_plans.created_by` → `users.id`
- `visit_reports.visit_plan_id` → `visit_plans.id`
- `visit_reports.customer_id` → `customers.id`
- `visit_reports.created_by` → `users.id`
- `articles.created_by` → `users.id`

## 📝 数据库 Schema

### 表结构关系图

```
users
  ├── customers (created_by)
  ├── visit_plans (created_by)
  ├── visit_reports (created_by)
  ├── articles (created_by)
  └── invitations (invited_by)

customers
  ├── visit_plans (customer_id)
  └── visit_reports (customer_id)

visit_plans
  └── visit_reports (visit_plan_id)
```

## 🔄 创建新迁移

当需要修改 schema 时：

### 1. 修改 Prisma schema

编辑 `backend/prisma/schema.prisma` 文件

### 2. 创建迁移文件

```bash
cd backend
npx prisma migrate dev --name your_migration_name
```

这会：
- 对比 schema 变化
- 生成 SQL 迁移文件
- 应用到数据库
- 重新生成 Client

### 3. 手动编辑迁移文件（可选）

如果需要自定义迁移逻辑，可以手动编辑生成的 SQL 文件。

## 📋 常用命令

```bash
# 查看迁移状态
npx prisma migrate status

# 重置数据库（开发环境）
npx prisma migrate reset

# 查看数据库结构
npx prisma db pull

# 生成 Prisma Client
npx prisma generate

# 打开 Prisma Studio（数据库可视化工具）
npx prisma studio
```

## ⚠️ 注意事项

1. **不要手动修改已应用的迁移文件**
   - 迁移文件名包含时间戳，修改可能导致冲突
   - 如需要修改，创建新的迁移

2. **生产环境迁移**
   - 使用 `prisma migrate deploy` 而不是 `prisma migrate dev`
   - 确保在应用迁移前备份数据库

3. **迁移顺序**
   - 迁移按照文件名时间戳顺序执行
   - 不要修改迁移文件的时间戳

4. **外键约束**
   - 所有外键都有 `ON DELETE CASCADE`
   - 删除用户会级联删除其创建的所有数据

5. **环境变量**
   - 确保 `DATABASE_URL` 配置正确
   - 使用不同环境时使用不同的数据库

## 🐛 常见问题

### Q: 迁移失败怎么办？

A: 
```bash
# 查看迁移状态
npx prisma migrate status

# 如果迁移部分应用，可能需要手动修复
# 或重置数据库（开发环境）
npx prisma migrate reset
```

### Q: 如何在团队中同步迁移？

A: 
1. 将迁移文件提交到 Git
2. 团队成员拉取代码后运行 `npx prisma migrate dev`
3. 或使用 `npx prisma migrate deploy` 应用迁移

### Q: 如何回滚迁移？

A: 
1. 开发环境：`npx prisma migrate reset`（会删除所有数据）
2. 生产环境：手动创建回滚 SQL 或从备份恢复

### Q: 迁移文件太多怎么办？

A: 
Prisma 会自动管理迁移文件，旧的迁移文件可以保留但不影响性能。

