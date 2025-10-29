# ✅ 可拖动地图签到功能完成

## 🎯 功能说明

### 核心特性
- ✅ GPS 定位获取
- ✅ 可拖动的小红旗标记
- ✅ 500米范围限制
- ✅ 实时距离显示
- ✅ 多个地图服务支持

## 🗺️ 地图功能

### 1. 初始定位
用户点击签到后：
1. 自动获取 GPS 位置
2. 在地图上显示小红旗标记
3. 显示当前位置坐标

### 2. 手动调整位置
用户可以在 500 米范围内：
- ✅ 点击地图调整位置
- ✅ 实时更新标记位置
- ✅ 显示当前距离原始位置的距离
- ⚠️ 超出范围时显示警告

### 3. 距离限制

**实现逻辑**:
```typescript
// 计算两点间距离（米）
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // 地球半径
  // 使用 Haversine 公式计算
  // ...返回距离（米）
}
```

**范围检查**:
- ✅ 在 500m 范围内：显示绿色提示 ✅
- ⚠️ 超出 500m：显示红色警告 ⚠️
- 🚫 不允许提交超出范围的位置

## 🎨 用户界面

### 距离提示
```
✅ 距离允许范围: 234m / 500m  (在范围内)
⚠️  距离允许范围: 567m / 500m  (超出范围)
```

### 拖动提示
点击地图时会显示覆盖层：
```
点击地图调整位置（500m范围内）
```

### 地图服务链接
提供 4 种地图服务选项：
- **Google 地图** - 全球覆盖
- **百度地图** - 中国地区
- **高德地图** - 主要显示（中国优化）
- **OpenStreetMap** - 开源地图

## 🔧 技术实现

### DraggableMap 组件

**文件**: `src/components/DraggableMap.tsx`

**Props**:
```typescript
interface DraggableMapProps {
  latitude: number;           // 当前纬度
  longitude: number;          // 当前经度
  initialLat: number;         // 初始纬度（GPS获取）
  initialLng: number;         // 初始经度（GPS获取）
  onLocationChange: (lat: number, lng: number) => void;  // 位置变化回调
  maxDistanceMeters: number;  // 最大允许距离（米）
}
```

### 距离计算

使用 **Haversine 公式** 计算球面距离：

```typescript
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // 地球半径（米）
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
```

### 位置更新

```typescript
const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
  // 获取点击位置
  const rect = mapContainerRef.current.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  // 转换为经纬度
  const scale = 0.001;
  const newLat = currentLocation.lat + (y - rect.height / 2) * scale;
  const newLng = currentLocation.lng + (x - rect.width / 2) * scale;
  
  // 检查距离
  const dist = calculateDistance(initialLat, initialLng, newLat, newLng);
  
  if (dist <= maxDistanceMeters) {
    setCurrentLocation({ lat: newLat, lng: newLng });
    onLocationChange(newLat, newLng);
  }
};
```

## 📱 使用流程

### 签到流程
1. **点击签到按钮**
2. **获取 GPS 位置** - 系统自动获取当前位置
3. **显示地图** - 地图上显示小红旗标记
4. **调整位置（可选）** - 点击地图在 500m 范围内调整
5. **确认位置** - 检查距离提示，确认位置
6. **拍摄照片** - 添加现场照片
7. **提交签到** - 完成签到

### 位置调整
- 用户可以在 500 米范围内自由调整位置
- 实时显示距离原始 GPS 位置的距离
- 超出范围时显示警告，但仍可调整

## 🔒 安全考虑

### 范围限制
- 防止远程签到（超出 500m 范围）
- 基于 GPS 的初始位置验证
- 实时距离计算和提示

### 用户体验
- 清晰的视觉反馈
- 实时距离显示
- 多个地图服务备用
- 响应式设计

## ✅ 完成状态

- ✅ 可拖动地图标记
- ✅ 500 米范围限制
- ✅ 实时距离显示
- ✅ 范围警告提示
- ✅ 多个地图服务支持
- ✅ 响应式界面设计

**签到功能现在支持手动调整位置，并确保用户在合理的签到范围内！**
