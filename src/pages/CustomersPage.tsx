import { useState, useEffect } from 'react';
import { MapPin, Phone, FileText, ChevronRight, X, Plus, Calendar, Edit, Trash2, ChevronLeft } from 'lucide-react';
import { customersApi, visitPlansApi } from '../lib/api';

interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  notes: string;
}

interface VisitPlan {
  id: string;
  planned_date: string;
  status: string;
  check_in_time: string | null;
  check_out_time: string | null;
}

interface VisitReport {
  id: string;
  start_time: string;
  end_time: string;
  communication_points: string;
  customer_feedback: string;
  follow_up_tasks: string;
  created_at: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [visits, setVisits] = useState<VisitPlan[]>([]);
  const [reports, setReports] = useState<VisitReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    address: '',
    notes: ''
  });
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [visitLoading, setVisitLoading] = useState(false);
  const [selectedCustomerForVisit, setSelectedCustomerForVisit] = useState<Customer | null>(null);
  const [newVisit, setNewVisit] = useState({
    planned_date: new Date().toISOString().split('T')[0]
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [selectedCustomerForEdit, setSelectedCustomerForEdit] = useState<Customer | null>(null);
  const [editCustomer, setEditCustomer] = useState({
    name: '',
    phone: '',
    address: '',
    notes: ''
  });
  const [customerPage, setCustomerPage] = useState(1);
  const [customersPerPage] = useState(10);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const data = await customersApi.getAll();
      // 按名称排序
      setCustomers(data.sort((a: Customer, b: Customer) => a.name.localeCompare(b.name)));
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerHistory = async (customerId: string) => {
    setDetailLoading(true);
    try {
      // 获取客户详情（包含拜访计划和报告）
      const customerData = await customersApi.getById(customerId);
      
      // 转换数据格式以匹配旧接口
      const visits = (customerData.visitPlans || []).map((plan: any) => ({
        id: plan.id,
        planned_date: plan.plannedDate,
        status: plan.status.toLowerCase(),
        check_in_time: plan.checkInTime,
        check_out_time: plan.checkOutTime
      })).sort((a: any, b: any) => new Date(b.planned_date).getTime() - new Date(a.planned_date).getTime());

      // 提取并转换报告
      const reports = [];
      customerData.visitPlans?.forEach((plan: any) => {
        if (plan.reports) {
          plan.reports.forEach((report: any) => {
            reports.push({
              id: report.id,
              visit_plan_id: report.visitPlanId,
              start_time: report.startTime,
              end_time: report.endTime,
              communication_points: report.communicationPoints || '',
              customer_feedback: report.customerFeedback || '',
              follow_up_tasks: report.followUpTasks || '',
              created_at: report.createdAt
            });
          });
        }
      });

      setVisits(visits);
      setReports(reports);
    } catch (error) {
      console.error('Error loading customer history:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCustomerClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    loadCustomerHistory(customer.id);
  };

  const handlePhoneClick = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleAddCustomer = async () => {
    if (!newCustomer.name.trim() || !newCustomer.phone.trim()) {
      alert('请填写客户姓名和电话');
      return;
    }

    setAddLoading(true);
    try {
      await customersApi.create({
        name: newCustomer.name.trim(),
        phone: newCustomer.phone.trim(),
        address: newCustomer.address.trim(),
        notes: newCustomer.notes.trim()
      });

      // 刷新客户列表
      await loadCustomers();
      
      // 关闭模态框并重置表单
      setShowAddModal(false);
      setNewCustomer({
        name: '',
        phone: '',
        address: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error adding customer:', error);
      alert('添加客户失败，请重试');
    } finally {
      setAddLoading(false);
    }
  };

  const handleCreateVisit = (customer: Customer) => {
    setSelectedCustomerForVisit(customer);
    setNewVisit({
      planned_date: new Date().toISOString().split('T')[0]
    });
    setShowVisitModal(true);
  };

  const handleAddVisit = async () => {
    if (!selectedCustomerForVisit) return;

    setVisitLoading(true);
    try {
      await visitPlansApi.create({
        customerId: selectedCustomerForVisit.id,
        plannedDate: newVisit.planned_date
      });

      // 关闭模态框并重置表单
      setShowVisitModal(false);
      setSelectedCustomerForVisit(null);
      setNewVisit({
        planned_date: new Date().toISOString().split('T')[0]
      });
      
      alert('拜访计划创建成功！');
    } catch (error) {
      console.error('Error creating visit:', error);
      alert('创建拜访计划失败，请重试');
    } finally {
      setVisitLoading(false);
    }
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomerForEdit(customer);
    setEditCustomer({
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      notes: customer.notes
    });
    setShowEditModal(true);
  };

  const handleUpdateCustomer = async () => {
    if (!selectedCustomerForEdit) return;

    if (!editCustomer.name.trim() || !editCustomer.phone.trim()) {
      alert('请填写客户姓名和电话');
      return;
    }

    setEditLoading(true);
    try {
      await customersApi.update(selectedCustomerForEdit.id, {
        name: editCustomer.name.trim(),
        phone: editCustomer.phone.trim(),
        address: editCustomer.address.trim(),
        notes: editCustomer.notes.trim()
      });

      // 刷新客户列表
      await loadCustomers();
      
      // 关闭模态框并重置表单
      setShowEditModal(false);
      setSelectedCustomerForEdit(null);
      setEditCustomer({
        name: '',
        phone: '',
        address: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error updating customer:', error);
      alert('更新客户失败，请重试');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteCustomer = async (customer: Customer) => {
    if (!confirm(`确定要删除客户"${customer.name}"吗？此操作不可撤销。`)) {
      return;
    }

    try {
      await customersApi.delete(customer.id);

      // 刷新客户列表
      await loadCustomers();
      alert('客户删除成功！');
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('删除客户失败，请重试');
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
      pending: 'text-amber-700 bg-amber-100',
      checked_in: 'text-blue-700 bg-blue-100',
      completed: 'text-emerald-700 bg-emerald-100',
      cancelled: 'text-slate-600 bg-slate-100',
    };
    return colorMap[status as keyof typeof colorMap] || 'bg-slate-100';
  };

  // 分页计算
  const customerIndexStart = (customerPage - 1) * customersPerPage;
  const customerIndexEnd = customerIndexStart + customersPerPage;
  const paginatedCustomers = customers.slice(customerIndexStart, customerIndexEnd);
  const totalCustomerPages = Math.ceil(customers.length / customersPerPage);

  const handleCustomerPageChange = (page: number) => {
    setCustomerPage(page);
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">客户列表</h1>
              <p className="text-sm text-slate-500 mt-1">共 {customers.length} 位客户</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors"
            >
              <Plus size={18} />
              <span className="text-sm font-medium">添加客户</span>
            </button>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-3">
        {paginatedCustomers.map((customer) => (
          <div
            key={customer.id}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              <div 
                className="flex-1 cursor-pointer"
                onClick={() => handleCustomerClick(customer)}
              >
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  {customer.name}
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-slate-600">
                    <Phone size={14} className="mr-2 flex-shrink-0" />
                    <span>{customer.phone}</span>
                  </div>
                  <div className="flex items-start text-sm text-slate-600">
                    <MapPin size={14} className="mr-2 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{customer.address}</span>
                  </div>
                  {customer.notes && (
                    <div className="flex items-start text-sm text-slate-600">
                      <FileText size={14} className="mr-2 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{customer.notes}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCreateVisit(customer);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center gap-1 transition-colors text-sm"
                >
                  <Calendar size={14} />
                  <span>新建拜访</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditCustomer(customer);
                  }}
                  className="bg-amber-600 hover:bg-amber-700 text-white p-2 rounded-lg transition-colors"
                  title="编辑客户"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCustomer(customer);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
                  title="删除客户"
                >
                  <Trash2 size={16} />
                </button>
                <ChevronRight size={20} className="text-slate-400 flex-shrink-0" />
              </div>
            </div>
          </div>
        ))}

        {/* 分页控件 */}
        {totalCustomerPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6 mb-4">
            <button
              onClick={() => handleCustomerPageChange(customerPage - 1)}
              disabled={customerPage === 1}
              className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            
            {Array.from({ length: totalCustomerPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handleCustomerPageChange(page)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  customerPage === page
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => handleCustomerPageChange(customerPage + 1)}
              disabled={customerPage === totalCustomerPages}
              className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      {selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="text-xl font-bold text-slate-800">{selectedCustomer.name}</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCreateVisit(selectedCustomer)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center gap-1 transition-colors text-sm"
                >
                  <Calendar size={14} />
                  <span>新建拜访</span>
                </button>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Phone size={16} className="text-slate-500 mr-2 flex-shrink-0" />
                    <span className="text-slate-700">{selectedCustomer.phone}</span>
                    <button
                      onClick={() => handlePhoneClick(selectedCustomer.phone)}
                      className="ml-auto text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      拨打
                    </button>
                  </div>
                  <div className="flex items-start">
                    <MapPin size={16} className="text-slate-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700 text-sm">{selectedCustomer.address}</span>
                  </div>
                  {selectedCustomer.notes && (
                    <div className="flex items-start pt-2 border-t border-slate-200">
                      <FileText size={16} className="text-slate-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700 text-sm">{selectedCustomer.notes}</span>
                    </div>
                  )}
                </div>
              </div>

              {detailLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
              ) : (
                <>
                  <div>
                    <h3 className="text-base font-semibold text-slate-800 mb-3">
                      拜访记录 ({visits.length})
                    </h3>
                    {visits.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-4">暂无拜访记录</p>
                    ) : (
                      <div className="space-y-2">
                        {visits.map((visit) => (
                          <div
                            key={visit.id}
                            className="p-4 bg-slate-50 rounded-xl border border-slate-200"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-slate-700">
                                {new Date(visit.planned_date).toLocaleDateString('zh-CN')}
                              </span>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                  visit.status
                                )}`}
                              >
                                {getStatusText(visit.status)}
                              </span>
                            </div>
                            {visit.check_in_time && (
                              <p className="text-xs text-slate-600">
                                签到: {new Date(visit.check_in_time).toLocaleTimeString('zh-CN')}
                              </p>
                            )}
                            {visit.check_out_time && (
                              <p className="text-xs text-slate-600">
                                签出: {new Date(visit.check_out_time).toLocaleTimeString('zh-CN')}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-slate-800 mb-3">
                      拜访报告 ({reports.length})
                    </h3>
                    {reports.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-4">暂无拜访报告</p>
                    ) : (
                      <div className="space-y-3">
                        {reports.map((report) => (
                          <div
                            key={report.id}
                            className="p-4 bg-slate-50 rounded-xl border border-slate-200"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-medium text-slate-700">
                                {new Date(report.start_time).toLocaleDateString('zh-CN')}
                              </span>
                              <span className="text-xs text-slate-500">
                                {new Date(report.start_time).toLocaleTimeString('zh-CN', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}{' '}
                                -{' '}
                                {new Date(report.end_time).toLocaleTimeString('zh-CN', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <div className="space-y-2 text-sm">
                              {report.communication_points && (
                                <div>
                                  <p className="font-medium text-slate-700 mb-1">沟通要点:</p>
                                  <p className="text-slate-600 text-xs leading-relaxed">
                                    {report.communication_points}
                                  </p>
                                </div>
                              )}
                              {report.customer_feedback && (
                                <div>
                                  <p className="font-medium text-slate-700 mb-1">客户反馈:</p>
                                  <p className="text-slate-600 text-xs leading-relaxed">
                                    {report.customer_feedback}
                                  </p>
                                </div>
                              )}
                              {report.follow_up_tasks && (
                                <div>
                                  <p className="font-medium text-slate-700 mb-1">待办事项:</p>
                                  <p className="text-slate-600 text-xs leading-relaxed">
                                    {report.follow_up_tasks}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 添加客户模态框 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="text-xl font-bold text-slate-800">添加客户</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  客户姓名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="请输入客户姓名"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  联系电话 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="请输入联系电话"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  地址
                </label>
                <textarea
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                  placeholder="请输入客户地址"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  备注
                </label>
                <textarea
                  value={newCustomer.notes}
                  onChange={(e) => setNewCustomer({ ...newCustomer, notes: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                  placeholder="请输入备注信息"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleAddCustomer}
                  disabled={addLoading}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {addLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      <span>添加中...</span>
                    </>
                  ) : (
                    '添加客户'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 新建拜访模态框 */}
      {showVisitModal && selectedCustomerForVisit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="text-xl font-bold text-slate-800">新建拜访计划</h2>
              <button
                onClick={() => setShowVisitModal(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h3 className="text-sm font-medium text-slate-700 mb-2">客户信息</h3>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-slate-600">
                    <span className="font-medium">姓名：</span>
                    <span>{selectedCustomerForVisit.name}</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <span className="font-medium">电话：</span>
                    <span>{selectedCustomerForVisit.phone}</span>
                  </div>
                  {selectedCustomerForVisit.address && (
                    <div className="flex items-start text-sm text-slate-600">
                      <span className="font-medium">地址：</span>
                      <span className="ml-1">{selectedCustomerForVisit.address}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  计划日期 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={newVisit.planned_date}
                  onChange={(e) => setNewVisit({ ...newVisit, planned_date: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowVisitModal(false)}
                  className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleAddVisit}
                  disabled={visitLoading}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {visitLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      <span>创建中...</span>
                    </>
                  ) : (
                    '创建拜访计划'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 编辑客户模态框 */}
      {showEditModal && selectedCustomerForEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="text-xl font-bold text-slate-800">编辑客户</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  客户姓名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editCustomer.name}
                  onChange={(e) => setEditCustomer({ ...editCustomer, name: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="请输入客户姓名"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  联系电话 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={editCustomer.phone}
                  onChange={(e) => setEditCustomer({ ...editCustomer, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="请输入联系电话"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  地址
                </label>
                <textarea
                  value={editCustomer.address}
                  onChange={(e) => setEditCustomer({ ...editCustomer, address: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                  placeholder="请输入客户地址"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  备注
                </label>
                <textarea
                  value={editCustomer.notes}
                  onChange={(e) => setEditCustomer({ ...editCustomer, notes: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                  placeholder="请输入备注信息"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleUpdateCustomer}
                  disabled={editLoading}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {editLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      <span>更新中...</span>
                    </>
                  ) : (
                    '更新客户'
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
