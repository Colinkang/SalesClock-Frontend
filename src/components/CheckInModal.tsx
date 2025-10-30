import { useState, useRef, useEffect } from 'react';
import { X, Camera, MapPin, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { visitPlansApi } from '../lib/api';
import AmapLiveMap from './AmapLiveMap';

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
  const [curTime, setCurTime] = useState(new Date());
  const [toast, setToast] = useState<{ type: 'success'|'error', message: string }|null>(null);

  useEffect(() => {
    let timer: any;
    if (isOpen) {
      setLocation(null); // 每次打开强制刷新定位
      getCurrentLocation();
      timer = setInterval(() => setCurTime(new Date()), 1000);
    }
    return () => {
      stopCamera();
      if (timer) clearInterval(timer);
    };
  }, [isOpen]);

  const getCurrentLocation = () => {
    setGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          setGettingLocation(false);
        },
        (error) => {
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
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
      }
    } catch (error) {
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
    if (videoRef.current && canvasRef.current && location) {
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
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, canvas.height - 100, canvas.width, 100);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 20px Arial';
        ctx.fillText(visit.customers.name, 20, canvas.height - 65);
        ctx.font = '16px Arial';
        ctx.fillText(`${dateStr} ${timeStr}`, 20, canvas.height - 40);
        ctx.fillText(`位置: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`, 20, canvas.height - 15);

        setPhoto(canvas.toDataURL('image/jpeg', 0.8));
        stopCamera();
      }
    }
  };

  // 改handleFileSelect为处理所有图片（拍照、选图）加水印与缩放
  const processImage = (img: HTMLImageElement) => {
    // 固定宽高，例如230x120px（16:9）
    const width = 230;
    const height = 120;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0, width, height);
    // 水印信息
    const now = new Date();
    const dateStr = now.toLocaleDateString('zh-CN');
    const timeStr = now.toLocaleTimeString('zh-CN');
    const name = visit.customers.name;
    const coord = location ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}` : '';
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, height - 44, width, 44);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 15px Arial';
    ctx.fillText(name, 12, height - 22);
    ctx.font = '12px Arial';
    ctx.fillText(dateStr + ' ' + timeStr, 12, height - 8);
    if(coord){ctx.font = '11px Arial'; ctx.fillText(coord, width/2, height - 8);}
    return canvas.toDataURL('image/jpeg', 0.85);
  }
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new window.Image();
      img.onload = () => {
        setPhoto(processImage(img));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const showToast = (type: 'success'|'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2000);
  };

  const handleSubmit = async () => {
    if (!location) {
      showToast('error','请等待获取位置信息');
      return;
    }
    if (!photo) {
      showToast('error','请拍摄现场照片');
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
      showToast('success','签到成功！');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch {
      showToast('error','签到失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[95vh] flex flex-col overflow-y-auto relative">
        {/* toast提示条浮层 */}
        {toast && (
          <div className={`fixed left-1/2 -translate-x-1/2 top-10 px-5 py-2 rounded-lg flex items-center gap-2 text-white z-[100] shadow-xl transition-all ${toast.type==='success'?'bg-emerald-600':'bg-red-500'}`}
               style={{minWidth:140, maxWidth:'80%', fontSize:'1rem', textAlign:'center'}}>
            {toast.type==='success'?(<CheckCircle size={20}/>):(<XCircle size={20}/>)}
            <span>{toast.message}</span>
          </div>
        )}
        {/* 打卡大地图和gps位置信息仿钉钉视觉 */}
        <div className="flex flex-col items-center pt-6 px-6">
          <div className="w-full rounded-xl overflow-hidden border border-slate-200" style={{height:192,minHeight:160,maxHeight:220}}>
            {gettingLocation || !location ? (
              <div className="flex items-center justify-center h-full text-slate-500"><Loader2 size={18} className="animate-spin mr-2" />正在获取位置...</div>
            ) : (
              <AmapLiveMap lat={location.lat} lng={location.lng} />
            )}
          </div>
          {location && (
            <div className="flex items-center w-full mt-4 text-base font-bold text-slate-900">
              <span className="truncate flex-1">{visit.customers.address || '未知地址'}</span>
              <MapPin size={20} className="ml-1 text-blue-600 flex-shrink-0" />
            </div>
          )}
          {location && (
            <div className="w-full text-xs text-slate-400 mt-0.5">
              {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
            </div>
          )}
        </div>
        {/* 备注、图片、签到按钮区块全部延用原有结构 */}
        <div className="px-6 pt-4 pb-2">
          <div className="text-slate-700 text-[15px] font-semibold mb-1">备注</div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg resize-none bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
            placeholder="请填写签到备注（可选）"
          />
        </div>
        {/* 图片区块 */}
        <div className="px-6 pb-1">
          <div className="text-slate-700 text-[15px] font-semibold mb-1">签到图片</div>
          {!photo && (
            <div className="w-full flex justify-center mt-2">
              <label className="w-full py-2 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium text-center cursor-pointer">
                + 上传图片/拍照
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}
          {photo && (
            <div className="mt-2 flex flex-col items-center">
              <img src={photo} alt="Check-in" className="w-full max-w-xs h-28 rounded-xl shadow object-cover" />
              <button
                onClick={() => setPhoto(null)}
                className="w-28 mt-2 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 text-sm font-medium"
              >重新选择</button>
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>
        {/* 底部签到按钮不变 */}
        <div className="flex flex-col items-center my-6">
          <button
            onClick={handleSubmit}
            disabled={loading || !location || !photo}
            className="rounded-full bg-gradient-to-b from-yellow-400 to-orange-400 shadow-lg hover:brightness-105 active:scale-95 transition-all flex flex-col items-center justify-center"
            style={{ width: 120, height: 120 }}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin text-white mb-1" size={30} />
                <span className="text-white text-base mt-0.5">签到中…</span>
              </>
            ) : (
              <>
                <span className="text-white text-lg font-bold">签到</span>
                <span className="text-white text-base mt-1">{curTime.toLocaleTimeString('zh-CN', { hour:'2-digit', minute:'2-digit', second:'2-digit' })}</span>
              </>
            )}
          </button>
          <div className="mt-3 text-slate-500 text-sm select-none">
            {curTime.toLocaleDateString('zh-CN')} {visit.customers.name}
          </div>
        </div>
        {/* 关闭按钮浮于右上 */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow hover:bg-slate-100 z-10"
        >
          <X size={22}/>
        </button>
      </div>
    </div>
  );
}
