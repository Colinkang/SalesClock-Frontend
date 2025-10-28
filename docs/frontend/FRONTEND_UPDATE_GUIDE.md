# 前端页面更新指南

## 概述

本指南说明如何将前端页面从 Supabase 更新为使用新的 Express + Prisma API。

## 更新步骤

### 1. 依赖检查

确保已安装 axios：
```bash
npm install axios
```

### 2. 已完成的文件

✅ `src/lib/api.ts` - API 客户端已创建完成

### 3. 需要更新的文件

需要更新以下文件中的 Supabase 调用为新的 API 调用：

#### A. src/App.tsx

**变更**:
- 移除 `import { supabase } from './lib/supabase';`
- 添加 `import { authApi } from './lib/api';`
- 更新 `checkSession` 使用 `authApi.getMe()`
- 移除 `onAuthStateChange` 监听
- 更新 `handleLogout` 使用 `authApi.logout()`

**代码示例**:
```typescript
// 之前
const { data: { session } } = await supabase.auth.getSession();

// 之后
const token = localStorage.getItem('token');
if (token) {
  await authApi.getMe();
}
```

#### B. src/pages/LoginPage.tsx

**变更**:
- 移除 `import { supabase } from '../lib/supabase';`
- 添加 `import { authApi } from '../lib/api';`
- 更新 `handleLogin` 使用 `authApi.login(email, password)`
- 移除 `handleSignUp` 函数

**代码示例**:
```typescript
// 之前
const { data, error } = await supabase.auth.signInWithPassword({
  email: email.trim(),
  password: password,
});

// 之后
const response = await authApi.login(email.trim(), password);
```

#### C. src/pages/CustomersPage.tsx

**变更**:
- 移除 `import { supabase } from '../lib/supabase';`
- 添加 `import { customersApi } from '../lib/api';`
- 更新所有数据库操作为 API 调用

**主要替换**:
```typescript
// 查询所有客户
// 之前
const { data, error } = await supabase
  .from('customers')
  .select('*')
  .order('created_at', { ascending: false });

// 之后
const customers = await customersApi.getAll();

// 创建客户
// 之前
const { error } = await supabase
  .from('customers')
  .insert({ ... });

// 之后
const customer = await customersApi.create({ ... });

// 更新客户
// 之前
await supabase
  .from('customers')
  .update({ ... })
  .eq('id', id);

// 之后
await customersApi.update(id, { ... });

// 删除客户
// 之前
await supabase
  .from('customers')
  .delete()
  .eq('id', id);

// 之后
await customersApi.delete(id);
```

#### D. src/pages/PlansPage.tsx

**变更**:
- 移除 `import { supabase } from '../lib/supabase';`
- 添加 `import { visitPlansApi } from '../lib/api';`
- 更新加载逻辑

**主要替换**:
```typescript
// 加载今日拜访
// 之前
const today = new Date().toISOString().split('T')[0];
const { data, error } = await supabase
  .from('visit_plans')
  .select('*, customers(*)')
  .eq('planned_date', today);

// 之后
const today = getTodayInChina();
const visits = await visitPlansApi.getAll({ date: today });

// 签到
// 之前
await supabase
  .from('visit_plans')
  .update({ ... })
  .eq('id', visitId);

// 之后
await visitPlansApi.checkIn(visitId, {
  latitude,
  longitude,
  photoUrl,
  notes التح
});
```

#### E. src/pages/ArticlesPage.tsx

**变更**:
- 移除 `import { supabase } from '../lib/supabase';`
- 添加 `import { articlesApi } from '../lib/api';`
- 更新所有操作

**主要替换**:
```typescript
// 之前
const { data, error } = await supabase
  .from('articles')
  .select('*')
  .order('created_at', { ascending: false });

// 之后
const articles = await articlesApi.getAll();

// 创建文章
await articlesApi.create({ title, content });

// 更新文章
await articlesApi.update(id, { title, content });

// 删除文章
await articlesApi.delete(id);
```

#### F. src/pages/ProfilePage.tsx

**变更**:
- 移除 `import { supabaseArab } from '../lib/supabase';`
- 添加 `import { visitPlansApi } from '../lib/api';`
- 更新数据加载逻辑

**主要替换**:
```typescript
// 之前
const { data, error } = await supabase
  .from('visit_plans')
  .select('*, customers(*)')
  .order('planned_date', { ascending: false });

// 之后
const visits = await visitPlansApi.getAll();
```

## 通用注意事项

### 1. 错误处理

API 客户端会在遇到错误时抛出异常，需要添加 try-catch：

```typescript
try {
  const data = await customersApi.getAll();
  setCustomers(data);
} catch (error: any) {
  console.error('Error:', error);
  alert(error.response?.data?.error || '操作失败');
}
```

### 2. 数据格式差异

后端返回的数据结构可能与 Supabase 略有不同：

```typescript
// Supabase 返回
{ data: [...], error: null }

// 新 API 返回
[...]
```

### 3. 用户ID

不再需要手动传递 `created_by`，后端会从 JWT token 中提取。

### 4. 时间格式

确保传入的时间格式正确：
```typescript
// 日期字符串
'2024-01-15'

// 日期时间 ISO 字符串
'2024-01-15T10:00:00Z'
```

## 测试建议

1. **逐步测试**: 一次更新一个文件并测试
2. **检查网络请求**: 使用浏览器开发者工具查看 API 请求
3. **验证认证**: 确保登录和登出功能正常
4. **数据验证**: 确认数据正确加载和保存

## 快速命令

```bash
# 启动前端（确保后端已运行）
npm run dev

# 检查类型错误
npm run typecheck

# 代码检查
npm run lint
```

## 问题排查

### 401 Unauthorized
- 检查 token 是否正确存储在 localStorage
- 验证后端 JWT_SECRET 配置

### 404 Not Found
- 确认后端服务正在运行
- 检查 API URL 配置

### CORS 错误
- 确保后端配置了正确的 FRONTEND_URL
- 检查 CORS 中间件配置

## 下一步

更新完所有文件后：
1. 运行 `npm run dev` 测试应用
2. 检查浏览器控制台是否有错误
3. 测试所有主要功能
4. 部署到生产环境

