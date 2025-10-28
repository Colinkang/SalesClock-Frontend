import { useState, useEffect } from 'react';
import { MapPin, Phone, Clock, Users, TrendingUp, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
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
  planned_date: string;
  status: 'pending' | 'checked_in' | 'completed' | 'cancelled';
  check_in_time: string | null;
  check_out_time: string | null;
  customers: Customer;
}

interface VisitStats {
  totalVisits: number;
  completedVisits: number;
  pendingVisits: number;
  uniqueCustomers: number;
}

export default function ProfilePage() {
  const [stats, setStats] = useState<VisitStats>({
    totalVisits: 0,
    completedVisits: 0,
    pendingVisits: 0,
    uniqueCustomers: 0,
  });
  const [allVisits, setAllVisits] = useState<VisitPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [visitPage, setVisitPage] = useState(1);
  const [visitsPerPage] = useState(10);

  useEffect(() => {
    loadVisitData();
  }, []);

  const loadVisitData = async () => {
    setLoading(true);
    try {
      // 获取所有拜访计划
      const data = await visitPlansApi.getAll();
      
      // 转换数据格式以匹配旧接口
      const visits = data.map((plan: any) => ({
        id: plan.id,
        customer_id: plan.customerId,
        planned_date: plan.plannedDate,
        status: plan.status.toLowerCase(),
        check_in_time: plan.checkInTime,
        check_out_time: plan.checkOutTime,
        customers: plan.customer
      }));

      // 计算统计数据
      const completed = visits.filter((v: any) => v.status === 'completed');
      const pending = visits.filter((v: any) => v.status === 'pending');
      const uniqueCustomerIds = new Set(visits.map((v: any) => v.customer_id));

      setStats({
        totalVisits: visits.length,
        completedVisits: completed.length,
        pendingVisits: pending.length,
        uniqueCustomers: uniqueCustomerIds.size,
      });

      setAllVisits(visits);
    } catch (error) {
      console.error('Error loading visit data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneClick = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleNavigation = (customer: Customer) => {
    if (customer.latitude && customer.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${customer.latitude},${customer.longitude}`;
      window.open(url, '_blank');
    } else {
      alert('客户位置信息不可用');
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

  // 分页计算
  const visitIndexStart = (visitPage - 1) * visitsPerPage;
  const visitIndexEnd = visitIndexStart + visitsPerPage;
  const paginatedVisits = allVisits.slice(visitIndexStart, visitIndexEnd);
  const totalVisitPages = Math.ceil(allVisits.length / visitsPerPage);

  const handleVisitPageChange = (page: number) => {
    setVisitPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="px-6 py-5">
          <h1 className="text-2xl font-bold text-slate-800">我的</h1>
          <p className="text-sm text-slate-500 mt-1">拜访统计与记录</p>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* 统计数据卡片 */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg p-6 text-white">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingUp size={20} className="mr-2" />
            数据统计
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center mb-2">
                <CheckCircle size={18} className="mr-2" />
                <span className="text-sm opacity-90">总拜访数</span>
              </div>
              <p className="text-3xl font-bold">{stats.totalVisits}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center mb-2">
                <Users size={18} className="mr-2" />
                <span className="text-sm opacity-90">拜访客户</span>
              </div>
              <p className="text-3xl font-bold">{stats.uniqueCustomers}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center mb-2">
                <CheckCircle size={18} className="mr-2" />
                <span className="text-sm opacity-90">已完成</span>
              </div>
              <p className="text-3xl font-bold text-emerald-200">{stats.completedVisits}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center mb-2">
                <Clock size={18} className="mr-2" />
                <span className="text-sm opacity-90">待签到</span>
              </div>
              <p className="text-3xl font-bold text-amber-200">{stats.pendingVisits}</p>
            </div>
          </div>
        </div>

        {/* 拜访列表 */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <h3 className="text-lg font-bold text-slate-800 mb-4">全部拜访记录</h3>
          
          {allVisits.length > 0 ? (
            <div className="space-y-3">
              {paginatedVisits.map((visit) => (
                <div
                  key={visit.id}
                  className="bg-slate-50 rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="text-base font-semibold text-slate-800 mb-1">
                        {visit.customers.name}
                      </h4>
                      <div className="flex items-center text-sm text-slate-600 mb-1">
                        <MapPin size={14} className="mr-1 flex-shrink-0" />
                        <span className="line-clamp-1">{visit.customers.address}</span>
                      </div>
                      <div className="flex items-center text-xs text-slate-500">
                        <Clock size={12} className="mr-1 flex-shrink-0" />
                        <span>{new Date(visit.planned_date).toLocaleDateString('zh-CN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}</span>
                        {visit.check_in_time && (
                          <>
                            <span className="mx-2">•</span>
                            <span>签到: {new Date(visit.check_in_time).toLocaleTimeString('zh-CN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}</span>
                          </>
                        )}
                        {visit.check_out_time && (
                          <>
                            <span className="mx-2">•</span>
                            <span>签出: {new Date(visit.check_out_time).toLocaleTimeString('zh-CN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        visit.status
                      )}`}
                    >
                      {getStatusText(visit.status)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => handlePhoneClick(visit.customers.phone)}
                      className="flex items-center justify-center px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all duration-200 text-sm"
                    >
                      <Phone size={14} className="mr-1" />
                      电话
                    </button>
                    <button
                      onClick={() => handleNavigation(visit.customers)}
                      className="flex items-center justify-center px-3 py-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all duration-200 text-sm"
                    >
                      <MapPin size={14} className="mr-1" />
                      导航
                    </button>
                  </div>
                </div>
              ))}

              {/* 分页控件 */}
              {totalVisitPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6 mb-4">
                  <button
                    onClick={() => handleVisitPageChange(visitPage - 1)}
                    disabled={visitPage === 1}
                    className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  
                  {Array.from({ length: totalVisitPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handleVisitPageChange(page)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        visitPage === page
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handleVisitPageChange(visitPage + 1)}
                    disabled={visitPage === totalVisitPages}
                    className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
          </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-3">
                <CheckCircle size={32} className="text-slate-400" />
              </div>
              <p className="text-slate-500 text-base">暂无拜访记录</p>
            </div>
          )}
        </div>

        {/* 温馨提示 */}
        <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl border border-slate-200 p-6">
          <h3 className="text-base font-semibold text-slate-800 mb-3">温馨提示</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start">
              <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 mr-2 flex-shrink-0" />
              <span>每次拜访前请及时签到，记录准确位置信息</span>
            </li>
            <li className="flex items-start">
              <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 mr-2 flex-shrink-0" />
              <span>拜访结束后务必填写拜访报告，记录沟通要点</span>
            </li>
            <li className="flex items-start">
              <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 mr-2 flex-shrink-0" />
              <span>及时与客户保持沟通，提高客户满意度</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
