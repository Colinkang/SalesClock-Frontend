import { useState, useEffect } from 'react';
import { MapPin, ExternalLink } from 'lucide-react';

interface SimpleMapProps {
  latitude: number;
  longitude: number;
  className?: string;
}

export default function SimpleMap({ latitude, longitude, className = '' }: SimpleMapProps) {
  const [mapError, setMapError] = useState(false);

  // 生成不同地图服务的链接
  const mapLinks = {
    google: `https://maps.google.com/maps?q=${latitude},${longitude}&z=15`,
    baidu: `https://map.baidu.com/?q=${latitude},${longitude}`,
    amap: `https://uri.amap.com/marker?position=${longitude},${latitude}&name=当前位置`,
    osm: `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=15`
  };

  return (
    <div className={`bg-slate-100 rounded-lg p-4 ${className}`}>
      {!mapError ? (
        <div className="space-y-3">
          {/* 尝试显示高德地图 */}
          <div className="aspect-video bg-white rounded-lg overflow-hidden">
            <iframe
              src={`https://uri.amap.com/marker?position=${longitude},${latitude}&name=当前位置&src=myapp`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              onError={() => setMapError(true)}
              title="Location Map"
            />
          </div>
          
          {/* 地图服务链接 */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <a
              href={mapLinks.google}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <ExternalLink size={12} className="mr-1" />
              Google地图
            </a>
            <a
              href={mapLinks.baidu}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            >
              <ExternalLink size={12} className="mr-1" />
              百度地图
            </a>
            <a
              href={mapLinks.amap}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
            >
              <ExternalLink size={12} className="mr-1" />
              高德地图
            </a>
            <a
              href={mapLinks.osm}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ExternalLink size={12} className="mr-1" />
              OpenStreetMap
            </a>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* 显示坐标信息 */}
          <div className="text-center p-4 bg-white rounded-lg">
            <MapPin size={24} className="text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-slate-600 mb-1">坐标位置</p>
            <p className="font-mono text-sm text-slate-800">
              {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </p>
          </div>
          
          {/* 地图服务链接 */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <a
              href={mapLinks.google}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <ExternalLink size={12} className="mr-1" />
              Google地图
            </a>
            <a
              href={mapLinks.baidu}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            >
              <ExternalLink size={12} className="mr-1" />
              百度地图
            </a>
            <a
              href={mapLinks.amap}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
            >
              <ExternalLink size={12} className="mr-1" />
              高德地图
            </a>
            <a
              href={mapLinks.osm}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ExternalLink size={12} className="mr-1" />
              OpenStreetMap
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
