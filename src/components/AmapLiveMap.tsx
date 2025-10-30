import React, { useEffect, useRef } from 'react';

interface AmapLiveMapProps {
  lat: number;
  lng: number;
  address?: string;
  width?: number | string;
  height?: number | string;
}

declare global {
  interface Window { AMap: any }
}

const AmapLiveMap: React.FC<AmapLiveMapProps> = ({ lat, lng, width = '100%', height = 180 }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!mapRef.current) return;
    if (!window.AMap) {
      const script = document.createElement('script');
      script.src = 'https://webapi.amap.com/maps?v=2.0&key='+ (import.meta.env.VITE_AMAP_KEY || '');
      script.async = true;
      script.onload = () => initMap();
      document.head.appendChild(script);
      return;
    }
    initMap();
    function initMap() {
      const map = new window.AMap.Map(mapRef.current, {
        center: [lng, lat],
        zoom: 17,
        dragEnable: false,
        resizeEnable: true,
      });
      const marker = new window.AMap.Marker({
        position: [lng, lat],
        icon: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
        anchor: 'bottom-center',
      });
      map.add(marker);
    }
    // eslint-disable-next-line
  }, [lat, lng]);
  return (
    <div style={{ width, height, borderRadius:12, overflow:'hidden', border:'1px solid #e5e7eb' }}>
      <div ref={mapRef} style={{ width:'100%', height:'100%' }} />
    </div>
  );
};
export default AmapLiveMap;
