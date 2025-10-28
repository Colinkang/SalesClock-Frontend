# 前端快速更新指南

## 已完成的文件

✅ `src/lib/api.ts` - API 客户端
✅ `src/App.tsx` - 主应用文件（已更新为使用新 API）

## 需要手动更新的文件列表

### 1. src/pages/LoginPage.tsx

**需要替换**:
- 第 3 行: `import { supabase } from '../lib/supabase';`
- 替换为: `import { authApi } from '../lib/api';`

- 第 26-35 行: 登录逻辑
```typescript
// 替换这段代码
const { data, error: loginError } = await supabase.auth.signInWithPassword({
  email: email.trim(),
  password: password,
});

if (loginError) throw loginError;
if (data.user) {
  onLogin();
}

// 替换为
const response = await authApi.login(email.trim(), password);
onLogin();
```

- 第 49-53 行: 密码重置
```typescript
// 暂时注释掉或移除
const { error: resetError } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
  redirectTo: window.location.origin,
});

if (resetError) throw resetError;

setResetSent(true);
```

### 2. src/pages/CustomersPage.tsx

**需要替换**:
1. 导入: `import { customersApi } from '../lib/api';`

2. 加载客户（查找 `supabase.from('customers')`）:
```typescript
// 替换为
const customers = await customersApi.getAll();
setCustomers(customers);
```

3. 创建客户:
```typescript
const customer = await customersApi.create({
  name,
  phone,
  address,
  latitude,
  longitude,
  notes,
});
```

4. 更新和删除客户:
```typescript
await customersApi.update(id, {...});
await customersApi.delete(id);
```

### 3. src/pages/PlansPage.tsx

**需要替换**:
1. 导入: `import { visitPlansApi } from '../lib/api';`

2. 加载拜访计划:
```typescript
const visits = await visitPlansApi.getAll({ date: today });
```

3. 加载月计划:
```typescript
const visits = await visitPlansApi.getAll({ month: '2024-01' });
```

4. 创建计划:
```typescript
await visitPlansApi.create({
  customerId,
  plannedDate,
});
```

5. 签到:
```typescript
await visitPlansApi.checkIn(visitId, {
  latitude,
  longitude,
  photoUrl,
  notes,
});
```

### 4. src/pages/ArticlesPage.tsx

**需要替换**:
1. 导入: `import { articlesApi } from '../lib/api';`

2. 所有操作:
```typescript
const articles = await articlesApi.getAll();
await articlesApi.create({ title, content });
await articlesApi.update(id, { title, content });
await articlesApi.delete(id);
```

### 5. src/pages/ProfilePage.tsx

**需要替换**:
1. 导入: `import { visitPlansApi } from '../lib/api';`

2. 加载拜访记录:
```typescript
const visits = await visitPlansApi.getAll();
setVisits(visits);
```

## 通用错误处理模式

每个 API 调用都加上 try-catch:

```typescript
try {
  const data = await api.someMethod();
  // 处理数据
} catch (error: any) {
  console.error('Error:', error);
  alert(error.response?.data?.error || '操作失败');
}
```

## 快速测试

更新完文件后：

1. 运行 `npm run dev`
2. 检查浏览器控制台错误
3. 测试登录功能
4. 测试各个页面的数据加载

## 注意

- 数据格式可能略有不同
- 某些 Supabase 特性（如实时更新）需要特殊处理
- 确保后端服务在运行




