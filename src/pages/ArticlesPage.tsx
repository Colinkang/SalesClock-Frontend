import { useState, useEffect } from 'react';
import { FileText, Plus, X, Trash2, Edit } from 'lucide-react';
import { articlesApi } from '../lib/api';

interface Article {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [newArticle, setNewArticle] = useState({
    title: '',
    content: ''
  });
  const [editArticle, setEditArticle] = useState({
    title: '',
    content: ''
  });

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      const data = await articlesApi.getAll();
      // 转换为下划线命名以匹配接口定义
      const convertedData = data.map((article: any) => ({
        id: article.id,
        title: article.title,
        content: article.content,
        created_at: article.createdAt,
        updated_at: article.updatedAt
      }));
      setArticles(convertedData);
    } catch (error) {
      console.error('Error loading articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddArticle = async () => {
    if (!newArticle.title.trim()) {
      alert('请输入文章标题');
      return;
    }

    setLoading(true);
    try {
      await articlesApi.create({
        title: newArticle.title.trim(),
        content: newArticle.content.trim()
      });

      setNewArticle({
        title: '',
        content: ''
      });
      setShowAddModal(false);
      loadArticles();
    } catch (error) {
      console.error('Error adding article:', error);
      alert('添加文章失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleEditArticle = (article: Article) => {
    setSelectedArticle(article);
    setEditArticle({
      title: article.title,
      content: article.content
    });
    setShowEditModal(true);
  };

  const handleUpdateArticle = async () => {
    if (!selectedArticle) return;

    if (!editArticle.title.trim()) {
      alert('请输入文章标题');
      return;
    }

    setEditLoading(true);
    try {
      await articlesApi.update(selectedArticle.id, {
        title: editArticle.title.trim(),
        content: editArticle.content.trim()
      });

      setShowEditModal(false);
      setSelectedArticle(null);
      setEditArticle({
        title: '',
        content: ''
      });
      loadArticles();
    } catch (error) {
      console.error('Error updating article:', error);
      alert('更新文章失败，请重试');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteArticle = async (article: Article) => {
    if (!confirm(`确定要删除文章"${article.title}"吗？此操作不可撤销。`)) {
      return;
    }

    try {
      await articlesApi.delete(article.id);
      loadArticles();
      alert('文章删除成功！');
    } catch (error) {
      console.error('Error deleting article:', error);
      alert('删除文章失败，请重试');
    }
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
              <h1 className="text-2xl font-bold text-slate-800">文章</h1>
              <p className="text-sm text-slate-500 mt-1">
                共 {articles.length} 篇文章
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30"
            >
              <Plus size={24} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-3">
        {articles.length > 0 ? (
          articles.map((article) => (
            <div
              key={article.id}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-slate-600 mb-2 line-clamp-2 leading-relaxed">
                    {article.content}
                  </p>
                  <p className="text-xs text-slate-400">
                    {new Date(article.created_at).toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                  <button
                    onClick={() => handleEditArticle(article)}
                    className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-colors"
                    title="编辑文章"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteArticle(article)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    title="删除文章"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 mb-4">
              <FileText size={36} className="text-slate-400" />
            </div>
            <p className="text-slate-500 text-lg">暂无文章</p>
            <p className="text-slate-400 text-sm mt-2">点击右上角按钮添加文章</p>
          </div>
        )}
      </div>

      {/* 添加文章模态框 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="text-xl font-bold text-slate-800">添加文章</h2>
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
                  标题 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newArticle.title}
                  onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
                  placeholder="请输入文章标题"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  内容
                </label>
                <textarea
                  value={newArticle.content}
                  onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
                  placeholder="请输入文章内容"
                  rows={8}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
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
                  onClick={handleAddArticle}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl transition-colors"
                >
                  {loading ? '添加中...' : '添加文章'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 编辑文章模态框 */}
      {showEditModal && selectedArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="text-xl font-bold text-slate-800">编辑文章</h2>
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
                  标题 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editArticle.title}
                  onChange={(e) => setEditArticle({ ...editArticle, title: e.target.value })}
                  placeholder="请输入文章标题"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  内容
                </label>
                <textarea
                  value={editArticle.content}
                  onChange={(e) => setEditArticle({ ...editArticle, content: e.target.value })}
                  placeholder="请输入文章内容"
                  rows={8}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
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
                  onClick={handleUpdateArticle}
                  disabled={editLoading}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl transition-colors"
                >
                  {editLoading ? '更新中...' : '更新文章'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
