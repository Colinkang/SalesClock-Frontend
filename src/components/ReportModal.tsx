import { useState, useRef } from 'react';
import { X, Upload, FileText } from 'lucide-react';
import { visitReportsApi } from '../lib/api';

interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
}

interface VisitPlan {
  id: string;
  customer_id: string;
  customers: Customer;
}

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  visit: VisitPlan;
  onSuccess: () => void;
}

export default function ReportModal({ isOpen, onClose, visit, onSuccess }: ReportModalProps) {
  const [startTime, setStartTime] = useState(new Date().toISOString().slice(0, 16));
  const [endTime, setEndTime] = useState(new Date().toISOString().slice(0, 16));
  const [communicationPoints, setCommunicationPoints] = useState('');
  const [customerFeedback, setCustomerFeedback] = useState('');
  const [followUpTasks, setFollowUpTasks] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setAttachments((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!communicationPoints.trim()) {
      alert('请填写沟通要点');
      return;
    }

    setLoading(true);
    try {
      await visitReportsApi.create({
        visitPlanId: visit.id,
        customerId: visit.customer_id,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        communicationPoints: communicationPoints,
        customerFeedback: customerFeedback,
        followUpTasks: followUpTasks,
        attachments: attachments,
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('提交失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-xl font-bold text-slate-800">填写拜访报告</h2>
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
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                开始时间
              </label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-slate-700"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                结束时间
              </label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              沟通要点 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={communicationPoints}
              onChange={(e) => setCommunicationPoints(e.target.value)}
              placeholder="记录本次拜访的主要沟通内容..."
              rows={4}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-slate-700"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              客户反馈
            </label>
            <textarea
              value={customerFeedback}
              onChange={(e) => setCustomerFeedback(e.target.value)}
              placeholder="记录客户的意见和反馈..."
              rows={3}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-slate-700"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              后续待办事项
            </label>
            <textarea
              value={followUpTasks}
              onChange={(e) => setFollowUpTasks(e.target.value)}
              placeholder="记录需要跟进的事项..."
              rows={3}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-slate-700"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              附件
            </label>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 px-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl hover:bg-slate-100 hover:border-slate-400 transition-colors text-slate-600 font-medium flex items-center justify-center"
            >
              <Upload size={18} className="mr-2" />
              上传附件
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
            />
            {attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <div className="flex items-center flex-1 min-w-0">
                      <FileText size={16} className="text-slate-500 flex-shrink-0 mr-2" />
                      <span className="text-sm text-slate-700 truncate">
                        附件 {index + 1}
                      </span>
                    </div>
                    <button
                      onClick={() => removeAttachment(index)}
                      className="ml-2 text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      删除
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !communicationPoints.trim()}
            className="w-full py-4 px-6 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors font-semibold text-lg shadow-lg shadow-blue-600/30 disabled:shadow-none"
          >
            {loading ? '提交中...' : '提交报告'}
          </button>
        </div>
      </div>
    </div>
  );
}
