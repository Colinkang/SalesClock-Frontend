import React, { useMemo } from 'react';

interface StaticMapAdjustProps {
  latitude: number;
  longitude: number;
  initialLat: number;
  initialLng: number;
  onLocationChange: (lat: number, lng: number) => void;
  maxDistanceMeters?: number;
  width?: number; // px
  height?: number; // px
  zoom?: number; // 3-20
  addressText?: string;
}

const R_EARTH = 6371000; // meters

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R_EARTH * c;
};

const moveByMeters = (lat: number, lng: number, northMeters: number, eastMeters: number) => {
  const dLat = northMeters / 111320; // approx meters per degree latitude
  const dLng = eastMeters / (111320 * Math.cos((lat * Math.PI) / 180));
  return { lat: lat + dLat, lng: lng + dLng };
};

const StaticMapAdjust: React.FC<StaticMapAdjustProps> = ({
  latitude,
  longitude,
  initialLat,
  initialLng,
  onLocationChange,
  maxDistanceMeters = 500,
  width = 600,
  height = 240,
  zoom = 16,
  addressText,
}) => {
  const amapKey = (import.meta as any).env?.VITE_AMAP_KEY as string | undefined;

  const currentDistance = useMemo(
    () => calculateDistance(initialLat, initialLng, latitude, longitude),
    [initialLat, initialLng, latitude, longitude]
  );
  const isOutOfRange = currentDistance > maxDistanceMeters;

  const staticUrl = useMemo(() => {
    if (!amapKey) return '';
    const size = `${Math.max(1, width)}*${Math.max(1, height)}`;
    const marker = `mid,0xFF0000,A:${longitude},${latitude}`;
    return `https://restapi.amap.com/v3/staticmap?location=${longitude},${latitude}&zoom=${zoom}&size=${size}&markers=${marker}&key=${amapKey}`;
  }, [amapKey, width, height, zoom, latitude, longitude]);

  const nudge = (northMeters: number, eastMeters: number) => {
    const next = moveByMeters(latitude, longitude, northMeters, eastMeters);
    const dist = calculateDistance(initialLat, initialLng, next.lat, next.lng);
    if (dist > maxDistanceMeters) {
      alert(`超出允许范围（${maxDistanceMeters}米）`);
      return;
    }
    onLocationChange(next.lat, next.lng);
  };

  const step = 10; // meters per nudge

  return (
    <div className="space-y-2">
      <div className="relative w-full overflow-hidden rounded-lg border border-slate-200 bg-white">
        {amapKey ? (
          <img
            src={staticUrl}
            alt="静态地图"
            className="w-full h-60 object-cover"
            style={{ maxHeight: `${height}px` }}
          />
        ) : (
          <div className="w-full h-60 flex items-center justify-center text-slate-500">
            请在 .env 设置 VITE_AMAP_KEY 以显示静态地图
          </div>
        )}
        <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md text-[11px] font-medium bg-white/90 border border-slate-200 text-slate-700">
          距原始位置：{currentDistance.toFixed(0)} 米{isOutOfRange ? '（超出）' : ''}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-2">
          <div className="text-xs text-slate-500 mb-1">地址</div>
          <div className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm text-slate-700 line-clamp-2">
            {addressText || '未提供地址'}
          </div>
        </div>
        <div className="col-span-1">
          <div className="text-xs text-slate-500 mb-1">微调（≤{maxDistanceMeters}m）</div>
          <div className="grid grid-cols-3 gap-1">
            <div />
            <button
              onClick={() => nudge(step, 0)}
              className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs"
            >
              ↑
            </button>
            <div />
            <button
              onClick={() => nudge(0, -step)}
              className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs"
            >
              ←
            </button>
            <button
              onClick={() => onLocationChange(initialLat, initialLng)}
              className="px-2 py-1 rounded-md bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs text-blue-700"
            >
              复位
            </button>
            <button
              onClick={() => nudge(0, step)}
              className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs"
            >
              →
            </button>
            <div />
            <button
              onClick={() => nudge(-step, 0)}
              className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs"
            >
              ↓
            </button>
            <div />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaticMapAdjust;


