import { useEffect, useRef, useState } from 'react';

interface DraggableMapProps {
  latitude: number;
  longitude: number;
  initialLat: number;
  initialLng: number;
  onLocationChange: (lat: number, lng: number) => void;
  maxDistanceMeters: number;
}

// 计算两点之间的距离（米）
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
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

export default function DraggableMap({
  latitude,
  longitude,
  initialLat,
  initialLng,
  onLocationChange,
  maxDistanceMeters
}: DraggableMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [currentLocation, setCurrentLocation] = useState({ lat: latitude, lng: longitude });
  const [distance, setDistance] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setCurrentLocation({ lat: latitude, lng: longitude });
    const dist = calculateDistance(initialLat, initialLng, latitude, longitude);
    setDistance(dist);
  }, [latitude, longitude, initialLat, initialLng]);

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapContainerRef.current) return;
    
    const rect = mapContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // 将点击位置转换为经纬度（简单的近似计算）
    // 这里使用简化的偏移量计算
    const scale = 0.001; // 缩放因子，根据地图大小调整
    const newLat = currentLocation.lat + (y - rect.height / 2) * scale;
    const newLng = currentLocation.lng + (x - rect.width / 2) * scale;
    
    // 检查是否在允许范围内
    const dist = calculateDistance(initialLat, initialLng, newLat, newLng);
    if (dist <= maxDistanceMeters) {
      setCurrentLocation({ lat: newLat, lng: newLng });
      setDistance(dist);
      onLocationChange(newLat, newLng);
    }
  };

  const getMapUrl = () => {
    return `https://uri.amap.com/marker?position=${currentLocation.lng},${currentLocation.lat}&name=当前位置&src=myapp`;
  };

  const isWithinRange = distance <= maxDistanceMeters;

  return (
    <div className="space-y-3">
      {/* 距离提示 */}
      <div className={`text-xs px-3 py-2 rounded-lg ${
        isWithinRange 
          ? 'bg-green-50 text-green-700' 
          : 'bg-red-50 text-red-700'
      }`}>
        {isWithinRange ? '✅' : '⚠️'} 
        距离允许范围: {Math.round(distance)}m / {maxDistanceMeters}m
      </div>

      {/* 地图容器 */}
      <div 
        ref={mapContainerRef}
        className="relative aspect-video bg-slate-200 rounded-lg overflow-hidden"
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
      >
        {/* 高德地图 iframe */}
        <iframe
          src={getMapUrl()}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          title="Location Map"
        />
        
        {/* 拖动提示覆盖层 */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/50 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
            {isDragging ? '拖动调整位置...' : '点击地图调整位置（500m范围内）'}
          </div>
        </div>

        {/* 地图点击区域（透明覆盖层，用于捕获点击） */}
        <div 
          className="absolute inset-0 cursor-pointer"
          onClick={handleMapClick}
          title="点击调整位置"
        />
      </div>

      {/* 地图服务链接 */}
      <div className="grid grid-cols-4 gap-1 text-xs">
        <a
          href={`https://maps.google.com/maps?q=${currentLocation.lat},${currentLocation.lng}&z=15`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          Google
        </a>
        <a
          href={`https://map.baidu.com/?q=${currentLocation.lat},${currentLocation.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center p-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          百度
        </a>
        <a
          href={`https://uri.amap.com/marker?position=${currentLocation.lng},${currentLocation.lat}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center p-2 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          高德
        </a>
        <a
          href={`https://www.openstreetmap.org/?mlat=${currentLocation.lat}&mlon=${currentLocation.lng}&zoom=15`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center p-2 bg-gray-50 text-gray-600 rounded hover:bg-gray-100 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          OSM
        </a>
      </div>
    </div>
  );
}
