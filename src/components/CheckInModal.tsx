import { useState, useRef, useEffect } from 'react';
import { X, Camera, MapPin, Loader2 } from 'lucide-react';
import { visitPlansApi } from '../lib/api';

interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
}

interface VisitPlan {
  id: string;
  customer_id: string;
  status: string;
  customers: Customer;
}

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  visit: VisitPlan;
  onSuccess: () => void;
}

export default function CheckInModal({ isOpen, onClose, visit, onSuccess }: CheckInModalProps) {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen) {
      getCurrentLocation();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const getCurrentLocation = () => {
    setGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setGettingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setGettingLocation(false);
          alert('无法获取位置信息，请检查定位权限');
        }
      );
    } else {
      setGettingLocation(false);
      alert('浏览器不支持定位功能');
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('无法访问相机，请检查相机权限');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);

        const now = new Date();
        const dateStr = now.toLocaleDateString('zh-CN');
        const timeStr = now.toLocaleTimeString('zh-CN');
        const locationStr = location
          ? `位置: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
          : '';

        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, canvas.height - 100, canvas.width, 100);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 20px Arial';
        ctx.fillText(visit.customers.name, 20, canvas.height - 65);
        ctx.font = '16px Arial';
        ctx.fillText(`${dateStr} ${timeStr}`, 20, canvas.height - 40);
        ctx.fillText(locationStr, 20, canvas.height - 15);

        const photoData = canvas.toDataURL('image/jpeg', 0.8);
        setPhoto(photoData);
        stopCamera();
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          if (canvasRef.current) {
            const canvas = canvasRef.current;
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0);

              const now = new Date();
              const dateStr = now.toLocaleDateString('zh-CN');
              const timeStr = now.toLocaleTimeString('zh-CN');
              const locationStr = location
                ? `位置: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
                : '';

              ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
              ctx.fillRect(0, canvas.height - 100, canvas.width, 100);
              ctx.fillStyle = 'white';
              ctx.font = 'bold 20px Arial';
              ctx.fillText(visit.customers.name, 20, canvas.height - 65);
              ctx.font = '16px Arial';
              ctx.fillText(`${dateStr} ${timeStr}`, 20, canvas.height - 40);
              ctx.fillText(locationStr, 20, canvas.height - 15);

              const photoData = canvas.toDataURL('image/jpeg', 0.8);
              setPhoto(photoData);
            }
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!location) {
      alert('请等待获取位置信息');
      return;
    }

    if (!photo) {
      alert('请拍摄现场照片');
      return;
    }

    setLoading(true);
    try {
      await visitPlansApi.checkIn(visit.id, {
        latitude: location.lat,
        longitude: location.lng,
        photoUrl: photo,
        notes: notes
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error checking in:', error);
      alert('签到失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-bold text-slate-800">签到</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              拜访客户
            </label>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="font-medium text-slate-800">{visit.customers.name}</p>
              <p className="text-sm text-slate-600 mt-1">{visit.customers.address}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              GPS位置
            </label>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              {gettingLocation ? (
                <div className="flex items-center text-slate-600">
                  <Loader2 size={16} className="animate-spin mr-2" />
                  <span className="text-sm">正在获取位置...</span>
                </div>
              ) : location ? (
                <div className="space-y-2">
                  <div className="flex items-start">
                    <MapPin size={16} className="text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-sm text-slate-700">
                      {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                    </p>
                  </div>
                  <div className="aspect-video bg-slate-200 rounded-lg overflow-hidden">
                    <img
                      src={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+3b82f6(${location.lng},${location.lat})/${location.lng},${location.lat},15,0/400x300@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw`}
                      alt="Location Map"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ) : (
                <button
                  onClick={getCurrentLocation}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  点击获取位置
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              签到时间
            </label>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-sm text-slate-700">
                {new Date().toLocaleString('zh-CN', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              现场照片
            </label>
            {!photo && !cameraActive && (
              <div className="space-y-2">
                <button
                  onClick={startCamera}
                  className="w-full py-4 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
                >
                  <Camera size={20} className="mr-2" />
                  打开相机拍照
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 px-4 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium flex items-center justify-center"
                >
                  从相册选择
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            )}
            {cameraActive && (
              <div className="space-y-3">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-xl bg-black"
                />
                <div className="flex gap-2">
                  <button
                    onClick={capturePhoto}
                    className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                  >
                    拍摄
                  </button>
                  <button
                    onClick={stopCamera}
                    className="px-4 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}
            {photo && (
              <div className="space-y-3">
                <img src={photo} alt="Check-in" className="w-full rounded-xl" />
                <button
                  onClick={() => setPhoto(null)}
                  className="w-full py-2 px-4 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors text-sm font-medium"
                >
                  重新拍摄
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              备注（选填）
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="记录签到相关信息..."
              rows={3}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-slate-700"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !location || !photo}
            className="w-full py-4 px-6 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors font-semibold text-lg shadow-lg shadow-blue-600/30 disabled:shadow-none"
          >
            {loading ? '签到中...' : '确认签到'}
          </button>
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
