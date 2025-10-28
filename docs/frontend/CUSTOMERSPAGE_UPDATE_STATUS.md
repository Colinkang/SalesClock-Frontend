# CustomersPage.tsx 更新状态

## ✅ 已完成

1. **Import 语句已更新**
   ```typescript
   // 旧: import { supabase } from '../lib/supabase';
   // 新: import { customersApi, visitPlansApi } from '../lib/api';
   ```

2. **loadCustomers 函数已更新**
   ```typescript
   const data = await customersApi.getAll();
   ```

## ⏳ 待更新

1. **loadCustomerHistory 函数** (行 82-135)
   - 需要使用 `customersApi.getById(id)` 来获取客户详情
   - 客户详情包含 `visitPlans` 和 `reports`

2. **handleAddCustomer 函数** (行 146-187)
   - 需要使用 `customersApi.create(customer)`

3. **handleAddVisit 函数** (行 197-227)
   - 需要使用 `visitPlansApi.create(plan)`

4. **handleUpdateCustomer 函数** (行 ט-281)
   - 需要使用 `customersApi.update(id, customer)`

5. **handleDeleteCustomer 函数** (行 283-303)
   - 需要使用 `customersApi.delete(id)`

## 📝 注意事项

### API 响应格式变化

旧 API (Supabase):
```typescript
{
  id: 'uuid',
  planned_date: '2024-01-01',
  status: 'pending'
}
```

新 API (Express):
```typescript
{
  id: 'uuid',
  plannedDate: '2024-01-01',
  status: 'PENDING'
}
```

### 接口路径映射

- `customers` → `customersApi.getAll()`
- `customers/:id` → `customersApi.getById(id)` (包含 visitPlans 和 reports)
- `POST customers` → `customersApi.create(data)`
- `PUT customers/:id` → `customersApi.update(id, data)`
- `DELETE customers/:id` → `customersApi.delete(id)`
- `POST visit-plans` → `visitPlansApi.create(data)`

## 🎯 下一步

需要继续完成剩余的函数更新，确保所有 Supabase 调用都被替换为新的 API 调用。

