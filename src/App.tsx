import { useState, useEffect } from 'react';
import { authApi } from './lib/api';
import PlansPage from './pages/PlansPage';
import CustomersPage from './pages/CustomersPage';
import ArticlesPage from './pages/ArticlesPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import BottomNav from './components/BottomNav';
import { Loader2 } from 'lucide-react';

type Page = 'plans' | 'customers' | 'articles' | 'profile';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('plans');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          await authApi.getMe();
          setIsAuthenticated(true);
        }
      } catch (error) {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    authApi.logout();
    setIsAuthenticated(false);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'plans':
        return <PlansPage onLogout={handleLogout} />;
      case 'customers':
        return <CustomersPage />;
      case 'articles':
        return <ArticlesPage />;
      case 'profile':
        return <ProfilePage onLogout={handleLogout} />;
      default:
        return <PlansPage onLogout={handleLogout} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-blue-600" size={48} />
          <p className="text-slate-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 pb-20">
      <div className="max-w-md mx-auto">
        {renderPage()}
        <BottomNav currentPage={currentPage} onNavigate={setCurrentPage} />
      </div>
    </div>
  );
}

export default App;
