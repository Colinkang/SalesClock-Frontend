# ✅ CustomersPage.tsx 链表完成

## 🎉 更新总结

已成功将 `CustomersPage.tsx` 从 Supabase API 迁移到新的 Express API。

## ✅ 已更新的函数

### 1. Import 语句
```typescript
// 旧: import { supabase } from '../lib/supabase';
// 新: import { customersApi, visitPlansApi } from '../lib/api';
```

### 2. loadCustomers
- 使用 `customersApi.getAll()`
- 添加了客户端排序逻辑

### 3. loadCustomerHistory
- **旧方法**: 分别查询 visit_plans 和 visit_reports 表
- **新方法**: 使用 `customersApi.getById(id)` 获取完整客户数据（包含 visitPlans 和 reports）
- **数据转换**: 将新 API 的驼峰命名转换为旧 UI 期望的下划线命名
  - `plannedDate` → `planned_date`
  - `status: 'PENDING'` → `status: 'pending'`
  - `checkInTime` → `check_in_time`
  - `visitPlanId` → `visit_plan_id`
  - `communicationPoints` → `communication_points`
- **简化**: 移除了孤立报告清理逻辑（由后端处理）

### 4. handleAddCustomer
- 使用 `customersApi.create(customer)`
- 移除了 `.select()` 调用

### 5. handleAddVisit
- 使用 `visitPlansApi.create(plan)`
- 字段映射：
  - `customer_id` → `customerId`
  - `planned_date` → `plannedDate`
- 移除了手动设置 `status`

### 6. handleUpdateCustomer
- 使用 `customersApi.update(id, data)`
- 移除了手动设置 `updated_at`

### 7. handleDeleteCustomer
- 使用 `customersApi.delete(id)`
- 移除了 `.eq()` 调用

## 📊 API 响应格式变化

### 客户数据
```typescript
// 新 API 响应
{
  id: string,
  name: string,
  phone: string,
  address: string,
  latitude: number | null,
  longitude: number | null,
  notes: string,
  visitPlans: VisitPlan[]  // 嵌套关系
}

// VisitPlan
{
  id: string,
  plannedDate: string,      // 驼峰命名
  status: 'PENDING',        // 大写枚举
  checkInTime: string | null,
  reports: VisitReport[]    // 嵌套关系
}
```

### 数据转换逻辑
- 在 `loadCustomerHistory` 中进行格式转换
- 保持 UI 层面的一致性（使用下划线命名）
- 状态值转换为小写

## ✨ 改进

1. **更简洁**: 移除了多余的查询和转换逻辑
2. **更可靠**: 后端确保数据完整性
3. **更高效**: 单个 API 调用获取完整数据
4. **更一致**: 使用统一的 API 客户端

## 🧪 测试建议

1. **客户列表**
   - 加载客户列表
   - 验证排序是否正确

2. **客户详情**
   - 点击客户查看详情
   - 验证拜访计划和报告显示

3. **添加客户**
   - 测试添加新客户
   - 验证字段映射

4. **编辑客户**
   - 测试更新客户信息
   - 验证数据保存

5. **删除客户**
   - 测试删除功能
   - 验证级联删除（拜访计划和报告）

6. **创建拜访**
   - 测试新建拜访计划
   - 验证日期字段映射

## 📝 注意事项

1. **认证**: 所有 API 调用都会自动包含 JWT token（由 `api.ts` 的 interceptor 处理）

2. **错误处理**: 使用 `alert` 显示错误消息（可考虑改用 toast 通知）

3. **状态管理**: 保持了原有的 loading 状态和 UI 反馈

4. **数据格式**: UI 层仍然使用下划线命名，与后端驼峰命名通过转换层适配

## 🎯 下一步

- [ ] 更新 PlansPage.tsx
- [ ] 更新 ArticlesPage.tsx
- [ ] 更新 ProfilePage.tsx

## 📚 相关文档

- `backend/API_DOCUMENTATION.md` - API 接口文档
- `src/lib/api.ts` - API 客户端实现
- `CUSTOMERSPAGE_UPDATE_STATUS.md` - 更新过程记录

