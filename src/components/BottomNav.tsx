import { Calendar, Users, FileText, User } from 'lucide-react';

type Page = 'plans' | 'customers' | 'articles' | 'profile';

interface BottomNavProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export default function BottomNav({ currentPage, onNavigate }: BottomNavProps) {
  const navItems = [
    { id: 'plans' as Page, icon: Calendar, label: '计划' },
    { id: 'customers' as Page, icon: Users, label: '客户' },
    { id: 'articles' as Page, icon: FileText, label: '文章' },
    { id: 'profile' as Page, icon: User, label: '我的' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg">
      <div className="max-w-md mx-auto px-2">
        <div className="grid grid-cols-4 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center justify-center py-3 px-2 transition-all duration-200 ${
                  isActive
                    ? 'text-blue-600'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon
                  size={24}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={`transition-transform duration-200 ${
                    isActive ? 'scale-110' : ''
                  }`}
                />
                <span
                  className={`text-xs mt-1 font-medium ${
                    isActive ? 'font-semibold' : ''
                  }`}
                >
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute bottom-0 w-12 h-1 bg-blue-600 rounded-t-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
