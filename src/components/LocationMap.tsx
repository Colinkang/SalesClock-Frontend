import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// 修复 Leaflet 默认图标问题
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationMapProps {
  latitude: number;
  longitude: number;
  className?: string;
}

export default function LocationMap({ latitude, longitude, className = '' }: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // 创建地图实例
    const map = L.map(mapRef.current).setView([latitude, longitude], 15);

    // 添加高德地图瓦片（在中国地区显示更好）
    const gaodeLayer = L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
      subdomains: ['1', '2', '3', '4'],
      attribution: '© 高德地图',
      maxZoom: 18,
    });

    // 添加 OpenStreetMap 作为备用
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    });

    // 默认使用高德地图
    gaodeLayer.addTo(map);

    // 添加标记
    const marker = L.marker([latitude, longitude]).addTo(map);
    marker.bindPopup(`<b>当前位置</b><br/>纬度: ${latitude.toFixed(6)}<br/>经度: ${longitude.toFixed(6)}`).openPopup();

    // 存储地图实例
    mapInstanceRef.current = map;

    // 清理函数
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude]);

  return (
    <div 
      ref={mapRef} 
      className={`w-full h-full ${className}`}
      style={{ minHeight: '200px' }}
    />
  );
}
