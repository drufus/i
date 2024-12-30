import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, History, Settings, LogOut, Rocket, Shield } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  
  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'History', href: '/history', icon: History },
    { name: 'Settings', href: '/settings', icon: Settings },
    ...(user?.role === 'admin' ? [{ name: 'Admin', href: '/admin', icon: Shield }] : []),
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64">
            <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-white border-r">
              <div className="flex items-center flex-shrink-0 px-4">
                <Rocket className="h-8 w-8 text-indigo-600" />
                <h1 className="ml-2 text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  InstaCraft
                </h1>
              </div>
              <div className="mt-8 flex-grow flex flex-col">
                <nav className="flex-1 px-2 space-y-2">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`${
                          isActive
                            ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        } group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200`}
                      >
                        <Icon className={`mr-3 h-5 w-5 transition-colors ${
                          isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'
                        }`} />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>
              <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                <button
                  onClick={handleSignOut}
                  className="flex-shrink-0 w-full group block"
                >
                  <div className="flex items-center">
                    <LogOut className="inline-block h-5 w-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-700 group-hover:text-red-500 transition-colors">
                        Sign out
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}