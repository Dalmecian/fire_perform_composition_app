import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Eye, Music, Settings } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const navigationItems = [
    { path: '/', label: '全体タイムライン', icon: Home },
    { path: '/performers', label: '演技者別', icon: Users },
    { path: '/formations', label: '隊形', icon: Eye },
    { path: '/music', label: '楽曲管理', icon: Music },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* ナビゲーション */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold text-blue-400">演技練習サポート</h1>
            
            <div className="flex space-x-4">
              {navigationItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(path)
                      ? 'bg-blue-700 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon size={16} className="mr-2" />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto p-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;