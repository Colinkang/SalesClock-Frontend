# PlansPage.tsx 更新状态

## ✅ 已完成

1. **Import 语句已更新**
   ```typescript
   import { customersApi, visitPlansApi } from '../lib/api';
   ```

2. **loadVisits 函数已更新**
   - 使用 `visitPlansApi.getAll({ date })`
   - 数据格式转换已实现

3. **loadCustomers 函数已更新**
   - 使用 `customersApi.getAll()`

4. **loadMonthVisits 函数已更新**
   - 使用 `visitPlansApi.getAll({ month })`
   - 数据格式转换已实现

## ⏳ 待更新

还有以下函数需要更新（需要查找 supabase 调用）：

1. **handleAddPlan** - 创建拜访计划
2. **handleCheckOut** - 签出
3. **handleDeletePlan** - 删除计划

## 📝 注意事项

这个文件比较复杂，涉及：
- 日期视图和月历视图
- 客户数据加载
- 拜访计划 CRUD
- 日历生成逻辑

数据转换需要特别小心，因为新 API 使用驼峰命名，而旧 UI 期望下划线命名。

