# 前端更新状态

## ✅ 已完成

### 1. 基础文件
- ✅ `src/lib/api.ts` - API 客户端已创建
- ✅ `src/App.tsx` - 已更新为使用新 API
- ✅ `src/pages/LoginPage.tsx` - 已更新登录逻辑

## 📋 需要完成的文件

### 1. src/pages/CustomersPage.tsx
- 替换 `supabase` 为 `customersApi`
- 更新所有 CRUD 操作

### 2. src/pages/PlansPage.tsx
- 替换 `supabase` 为 `visitPlansApi`
- 更新加载、创建、签到等操作

### 3. src/pages/ArticlesPage.tsx
- 替换 `supabase` 为 `articlesApi`
- 更新所有操作

### 4. src/pages/ProfilePage.tsx
- 替换 `supabase` 为 `visitPlansApi`
- 更新数据加载

## 🎯 通用更新步骤

每个文件更新时：

1. **替换导入**：
```typescript
// 移除
import { supabase } from '../lib/supabase';

// 添加
import { xxxApi } from '../lib/api';
```

2. **更新查询**：
```typescript
// 之前
const { data, error } = await supabase.from('table').select();

// 之后
const data = await xxxApi.getAll();
```

3. **更新错误处理**：
```typescript
try {
  const data = await xxxApi.someMethod();
  // 使用数据
} catch (error: any) {
  console.error('Error:', error);
  alert(error.response?.data?.error || '操作失败');
}
```

## 📚 参考文档

- `QUICK_FRONTEND_UPDATE.md` - 快速更新指南
- `FRONTEND_UPDATE_GUIDE.md` - 详细更新指南
- `src/lib/api.ts` - API 方法列表

## 🚀 测试

更新完成后：
```bash
npm run dev
```

检查每个页面的功能是否正常。




