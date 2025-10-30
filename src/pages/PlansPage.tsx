import { useState, useEffect } from 'react';
import { MapPin, Phone, Navigation, FileText, CheckCircle, LogOut, Plus, X, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { customersApi, visitPlansApi } from '../lib/api';
import CheckInModal from '../components/CheckInModal';
import ReportModal from '../components/ReportModal';
import AmapLiveMap from '../components/AmapLiveMap';

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
  status: 'pending' | 'checked_in' | 'completed' | 'cancelled';
  check_in_time: string | null;
  check_out_time: string | null;
  planned_date: string;
  customers: Customer;
}

type ViewType = 'day' | 'month';

interface PlansPageProps {
  onLogout?: () => void;
}

export default function PlansPage({ onLogout }: PlansPageProps) {
  const [visits, setVisits] = useState<VisitPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<VisitPlan | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [newPlan, setNewPlan] = useState({
    customer_id: '',
    planned_date: new Date().toISOString().split('T')[0]
  });
  const [currentView, setCurrentView] = useState<ViewType>('day');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [monthVisits, setMonthVisits] = useState<VisitPlan[]>([]);

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    if (currentView === 'day') {
      loadVisits();
    } else if (currentView === 'month') {
      loadMonthVisits();
    }
  }, [currentView, currentDate]);

  const getTodayInChina = () => {
    const now = new Date();
    const chinaOffset = 8 * 60; // 东八区偏移量（分钟）
    const localOffset = now.getTimezoneOffset(); // 本地时区偏移量（分钟）
    const chinaTime = new Date(now.getTime() + (localOffset + chinaOffset) * 60 * 1000);
    const year = chinaTime.getUTCFullYear();
    const month = String(chinaTime.getUTCMonth() + 1).padStart(2, '0');
    const day = String(chinaTime.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const loadVisits = async () => {
    try {
      const today = getTodayInChina();
      const data = await visitPlansApi.getAll({ date: today });
      
      // 转换数据格式以匹配旧接口
      const convertedData = data.map((plan: any) => ({
        id: plan.id,
        customer_id: plan.customerId,
        status: plan.status.toLowerCase(),
        check_in_time: plan.checkInTime,
        check_out_time: plan.checkOutTime,
        // 将日期时间转换为日期字符串 YYYY-MM-DD
        planned_date: new Date(plan.plannedDate).toISOString().split('T')[0],
        customers: plan.customer
      }));
      
      setVisits(convertedData as VisitPlan[]);
    } catch (error) {
      console.error('Error loading visits:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const data = await customersApi.getAll();
      setCustomers(data);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const getDateInChina = (date: Date) => {
    const chinaOffset = 8 * 60; // 东八区偏移量（分钟）
    const localOffset = date.getTimezoneOffset(); // 本地时区偏移量（分钟）
    const chinaTime = new Date(date.getTime() + (localOffset + chinaOffset) * 60 * 1000);
    const year = chinaTime.getUTCFullYear();
    const month = String(chinaTime.getUTCMonth() + 1).padStart(2, '0');
    const day = String(chinaTime.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const loadMonthVisits = async () => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const monthStr = `${year}-${String(month).padStart(2, '0')}`;
      
      const data = await visitPlansApi.getAll({ month: monthStr });
      
      // 转换数据格式以匹配旧接口
      const convertedData = data.map((plan: any) => ({
        id: plan.id,
        customer_id: plan.customerId,
        status: plan.status.toLowerCase(),
        check_in_time: plan.checkInTime,
        check_out_time: plan.checkOutTime,
        // 将日期时间转换为日期字符串 YYYY-MM-DD
        planned_date: new Date(plan.plannedDate).toISOString().split('T')[0],
        customers: plan.customer
      }));
      
      setMonthVisits(convertedData as VisitPlan[]);
    } catch (error) {
      console.error('Error loading month visits:', error);
    }
  };

  const handleAddPlan = async () => {
    if (!newPlan.customer_id) {
      alert('请选择客户');
      return;
    }

    setAddLoading(true);
    try {
      await visitPlansApi.create({
        customerId: newPlan.customer_id,
        plannedDate: newPlan.planned_date
      });

      // 刷新计划列表
      if (currentView === 'day') {
        await loadVisits();
      } else {
        await loadMonthVisits();
      }
      
      // 关闭模态框并重置表单
      setShowAddModal(false);
      setNewPlan({
        customer_id: '',
        planned_date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Error adding plan:', error);
      alert('添加计划失败，请重试');
    } finally {
      setAddLoading(false);
    }
  };

  const handleCheckIn = (visit: VisitPlan) => {
    setSelectedVisit(visit);
    setCheckInModalOpen(true);
  };

  const handleCheckOut = async (visit: VisitPlan) => {
    try {
      await visitPlansApi.update(visit.id, {
        status: 'COMPLETED',
        checkOutTime: new Date().toISOString()
      });
      if (currentView === 'day') {
        loadVisits();
      } else {
        loadMonthVisits();
      }
    } catch (error) {
      console.error('Error checking out:', error);
    }
  };

  const handlePhone = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const openSystemNavigation = (customer: Customer) => {
    const name = encodeURIComponent(customer.name || '目的地');
    const hasCoords = !!(customer.latitude && customer.longitude);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    if (!hasCoords && !customer.address) {
      alert('客户位置信息不可用，请先添加客户地址');
      return;
    }

    if (hasCoords) {
      const lat = customer.latitude as number;
      const lng = customer.longitude as number;
      const appleUrl = `https://maps.apple.com/?daddr=${lat},${lng}&q=${name}`;
      const androidGeo = `geo:${lat},${lng}?q=${lat},${lng}(${name})`;
      const googleWeb = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;

      if (isIOS) {
        window.location.href = appleUrl;
        return;
      }
      if (isAndroid) {
        try {
          window.location.href = androidGeo;
        } catch (_e) {
          window.open(googleWeb, '_blank');
        }
        return;
      }
      window.open(googleWeb, '_blank');
      return;
    }

    const addr = encodeURIComponent(customer.address as string);
    const appleUrl = `https://maps.apple.com/?daddr=${addr}&q=${name}`;
    const androidGeo = `geo:0,0?q=${addr}(${name})`;
    const googleWeb = `https://www.google.com/maps/dir/?api=1&destination=${addr}&travelmode=driving`;

    if (isIOS) {
      window.location.href = appleUrl;
      return;
    }
    if (isAndroid) {
      try {
        window.location.href = androidGeo;
      } catch (_e) {
        window.open(googleWeb, '_blank');
      }
      return;
    }
    window.open(googleWeb, '_blank');
  };

  const handleWriteReport = (visit: VisitPlan) => {
    setSelectedVisit(visit);
    setReportModalOpen(true);
  };

  const handleDeletePlan = async (visit: VisitPlan) => {
    if (!confirm(`确定要删除与"${visit.customers.name}"的拜访计划吗？此操作不可撤销。`)) {
      return;
    }

    try {
      await visitPlansApi.delete(visit.id);

      // 刷新计划列表
      if (currentView === 'day') {
        await loadVisits();
      } else {
        await loadMonthVisits();
      }
      alert('拜访计划删除成功！');
    } catch (error) {
      console.error('Error deleting plan:', error);
      alert('删除拜访计划失败，请重试');
    }
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      pending: '待签到',
      checked_in: '进行中',
      completed: '已完成',
      cancelled: '已取消',
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap = {
      pending: 'bg-amber-100 text-amber-700 border-amber-200',
      checked_in: 'bg-blue-100 text-blue-700 border-blue-200',
      completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      cancelled: 'bg-slate-100 text-slate-600 border-slate-200',
    };
    return colorMap[status as keyof typeof colorMap] || 'bg-slate-100';
  };

  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const days = [];
    const visitsByDate = new Map<string, number>();

    monthVisits.forEach((visit) => {
      const dateKey = visit.planned_date;
      visitsByDate.set(dateKey, (visitsByDate.get(dateKey) || 0) + 1);
    });

    // 获取今天的东八区日期
    const todayInChina = getTodayInChina();

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateKey = getDateInChina(date);
      const visitCount = visitsByDate.get(dateKey) || 0;

      days.push({
        date,
        dateKey,
        visitCount,
        isCurrentMonth: date.getMonth() === month,
        isToday: dateKey === todayInChina,
      });
    }

    return days;
  };

  const handleDateClick = (dateKey: string) => {
    setSelectedDate(dateKey);
  };

  const getSelectedDateVisits = () => {
    if (!selectedDate) return [];
    return monthVisits.filter(visit => visit.planned_date === selectedDate);
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  const renderVisitCard = (visit: VisitPlan) => (
    <div
      key={visit.id}
      className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-200"
    >
      <div className="p-5">
        {/* 删除地图和定位展示，仅保留客户名、状态、按钮区等 */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-800 mb-1">
              {visit.customers.name}
            </h3>
            <div className="flex items-center text-sm text-slate-600 mb-2">
              <MapPin size={14} className="mr-1 flex-shrink-0" />
              <span className="line-clamp-1">{visit.customers.address}</span>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
              visit.status
            )}`}
          >
            {getStatusText(visit.status)}
          </span>
        </div>

        {visit.check_in_time && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-xs text-blue-700 font-medium">
              签到时间：
              {new Date(visit.check_in_time).toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        )}

        <div className="grid grid-cols-5 gap-2">
          {visit.status === 'pending' && (
            <button
              onClick={() => handleCheckIn(visit)}
              className="flex flex-col items-center justify-center py-3 px-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all duration-200 shadow-sm"
            >
              <CheckCircle size={20} strokeWidth={2.5} />
              <span className="text-xs mt-1 font-medium">签到</span>
            </button>
          )}

          {visit.status === 'checked_in' && (
            <button
              onClick={() => handleCheckOut(visit)}
              className="flex flex-col items-center justify-center py-3 px-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 transition-all duration-200 shadow-sm"
            >
              <LogOut size={20} strokeWidth={2.5} />
              <span className="text-xs mt-1 font-medium">签出</span>
            </button>
          )}

          <button
            onClick={() => handlePhone(visit.customers.phone)}
            className="flex flex-col items-center justify-center py-3 px-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 active:scale-95 transition-all duration-200"
          >
            <Phone size={20} strokeWidth={2} />
            <span className="text-xs mt-1 font-medium">电话</span>
          </button>

          <button
            onClick={() => openSystemNavigation(visit.customers)}
            className="flex flex-col items-center justify-center py-3 px-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 active:scale-95 transition-all duration-200"
          >
            <Navigation size={20} strokeWidth={2} />
            <span className="text-xs mt-1 font-medium">导航</span>
          </button>

          <button
            onClick={() => handleWriteReport(visit)}
            disabled={visit.status === 'pending'}
            className="flex flex-col items-center justify-center py-3 px-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            <FileText size={20} strokeWidth={2} />
            <span className="text-xs mt-1 font-medium">报告</span>
          </button>

          <button
            onClick={() => handleDeletePlan(visit)}
            className="flex flex-col items-center justify-center py-3 px-2 rounded-xl bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 active:scale-95 transition-all duration-200"
          >
            <Trash2 size={20} strokeWidth={2} />
            <span className="text-xs mt-1 font-medium">删除</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {currentView === 'day' ? '今日计划' : '月度计划'}
              </h1>
              {currentView === 'day' ? (
                (() => {
                  const chinaOffset = 8 * 60;
                  const localOffset = new Date().getTimezoneOffset();
                  const chinaTime = new Date(new Date().getTime() + (localOffset + chinaOffset) * 60 * 1000);
                  const dayStr = chinaTime.toLocaleDateString('zh-CN',{year:'numeric',month:'long',day:'numeric'});
                  const weekStr = chinaTime.toLocaleDateString('zh-CN',{weekday:'long'});
                  return <>
                    <div className="text-base text-slate-700 mt-0.5">{dayStr}</div>
                    <div className="text-xs text-slate-500 mt-0.5" style={{letterSpacing:1}}>{weekStr}</div>
                  </>;
                })()
              ) : (
                <div className="text-base text-slate-700 mt-1">{currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月</div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => setCurrentView('day')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'day' 
                      ? 'bg-white text-slate-800 shadow-sm' 
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  日
                </button>
                <button
                  onClick={() => setCurrentView('month')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'month' 
                      ? 'bg-white text-slate-800 shadow-sm' 
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  月
                </button>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors"
              >
                <Plus size={18} />
                <span className="text-sm font-medium">添加计划</span>
              </button>
              {/* 退出登录按钮已移除到ProfilePage */}
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-3">
        {currentView === 'month' ? (
          <>
            {/* 日历导航 */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={previousMonth}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <ChevronLeft size={20} className="text-slate-600" />
                </button>
                <h3 className="text-lg font-bold text-slate-800">
                  {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月
                </h3>
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <ChevronRight size={20} className="text-slate-600" />
                </button>
              </div>

              {/* 日历网格 */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs font-semibold text-slate-500 py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {generateCalendar().map((day, index) => {
                  const isSelected = selectedDate === day.dateKey;
                  const displayDate = parseInt(day.dateKey.split('-')[2]);
                  return (
                    <div
                      key={index}
                      className={`
                        aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-all duration-200 cursor-pointer
                        ${
                          !day.isCurrentMonth
                            ? 'text-slate-300'
                            : day.isToday
                            ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/30'
                            : isSelected
                            ? 'bg-blue-100 text-blue-800 font-semibold border-2 border-blue-400'
                            : 'text-slate-700 hover:bg-slate-50'
                        }
                      `}
                      onClick={() => day.isCurrentMonth && handleDateClick(day.dateKey)}
                    >
                      <span className={day.isToday ? 'text-base' : ''}>
                        {displayDate}
                      </span>
                      {day.visitCount > 0 && (
                        <div className="flex gap-0.5 mt-0.5">
                          {Array.from({ length: Math.min(day.visitCount, 3) }).map((_, i) => (
                            <div
                              key={i}
                              className={`w-1 h-1 rounded-full ${
                                day.isToday ? 'bg-white' : 'bg-blue-500'
                              }`}
                            />
                          ))}
                          {day.visitCount > 3 && (
                            <span className="text-xs text-blue-500">+</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 选中日期的计划列表 */}
            {selectedDate && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
                <h3 className="text-lg font-semibold text-slate-800 mb-3">
                  {(() => {
                    const [year, month, day] = selectedDate.split('-').map(Number);
                    const date = new Date(year, month - 1, day);
                    return date.toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      weekday: 'long',
                    });
                  })()} 的拜访计划
                </h3>
                {getSelectedDateVisits().length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">当日暂无拜访计划</p>
                ) : (
                  <div className="space-y-3">
                    {getSelectedDateVisits().map((visit) => renderVisitCard(visit))}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            {visits.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 mb-4">
                  <MapPin size={36} className="text-slate-400" />
                </div>
                <p className="text-slate-500 text-lg">今日暂无拜访计划</p>
              </div>
            ) : (
              visits.map(visit => renderVisitCard(visit))
            )}
          </>
        )}
      </div>

      {selectedVisit && (
        <>
          <CheckInModal
            isOpen={checkInModalOpen}
            onClose={() => {
              setCheckInModalOpen(false);
              setSelectedVisit(null);
            }}
            visit={selectedVisit}
            onSuccess={() => {
              if (currentView === 'day') {
                loadVisits();
              } else {
                loadMonthVisits();
              }
            }}
          />
          <ReportModal
            isOpen={reportModalOpen}
            onClose={() => {
              setReportModalOpen(false);
              setSelectedVisit(null);
            }}
            visit={selectedVisit}
            onSuccess={() => {
              if (currentView === 'day') {
                loadVisits();
              } else {
                loadMonthVisits();
              }
            }}
          />
        </>
      )}

      {/* 地图选择器 */}
      

      {/* 添加计划模态框 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto flex flex-col items-center justify-center">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10 w-full">
              <h2 className="text-xl font-bold text-slate-800 text-center w-full">添加计划</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors absolute right-4 top-4"
              >
                <X size={20} />
              </button>
            </div>

            <div className="py-8 w-full flex flex-col items-center">
              <div className="mb-5 w-full flex flex-col items-center">
                <label className="block text-[1.15rem] font-bold text-slate-700 mb-3 text-center">
                  选择客户 <span className="text-red-500">*</span>
                </label>
                <select
                  value={newPlan.customer_id}
                  onChange={(e) => setNewPlan({ ...newPlan, customer_id: e.target.value })}
                  className="w-[90%] min-h-[48px] text-lg px-4 py-3 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors mb-2 text-center"
                  style={{margin:'0 auto'}}
                >
                  <option value="">请选择客户</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id} className="text-center">
                      {customer.name} - {customer.phone}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-6 w-full flex flex-col items-center">
                <label className="block text-[1.15rem] font-bold text-slate-700 mb-3 text-center">
                  计划日期 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={newPlan.planned_date}
                  onChange={(e) => setNewPlan({ ...newPlan, planned_date: e.target.value })}
                  className="w-[90%] min-h-[48px] text-lg px-4 py-3 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-center"
                  style={{margin:'0 auto'}}
                />
              </div>

              <div className="flex gap-3 w-[90%] pt-3 justify-center">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors text-lg"
                  style={{minWidth:'40%'}}
                >
                  取消
                </button>
                <button
                  onClick={handleAddPlan}
                  disabled={addLoading}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl transition-colors flex items-center justify-center gap-2 text-lg"
                  style={{minWidth:'40%'}}
                >
                  {addLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      <span>添加中...</span>
                    </>
                  ) : (
                    '添加计划'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
