import { Outlet, NavLink } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { LogOut, Home, Factory, ShoppingCart, Package, Truck, Map, Settings, CheckCircle, Wrench, DollarSign, MapPin } from 'lucide-react';
import NotificationBell from '../common/NotificationBell';

export default function Layout() {
  const { user, logout } = useAuthStore();

  const menuItems = [
    { path: '/app/dashboard', label: 'Tableau de bord', icon: Home },
    { path: '/app/production', label: 'Production', icon: Factory },
    { path: '/app/quality', label: 'Qualité', icon: CheckCircle },
    { path: '/app/inventory', label: 'Stocks', icon: Package },
    { path: '/app/sales', label: 'Ventes', icon: ShoppingCart },
    { path: '/app/costs', label: 'Coûts', icon: DollarSign },
    { path: '/app/maintenance', label: 'Maintenance', icon: Wrench },
    { path: '/app/delivery', label: 'Livraisons', icon: Truck },
    { path: '/app/agropole', label: 'Agropôle', icon: Map },
    { path: '/app/map', label: 'Cartographie', icon: MapPin },
    { path: '/app/settings', label: 'Paramètres', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-sm flex flex-col">
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <img 
                src="/logo.jpg" 
                alt="MALAO Logo" 
                className="h-10 w-auto object-contain"
              />
              <h1 className="text-2xl font-bold text-malao-orange">MALAO</h1>
            </div>
            <NotificationBell />
          </div>
          <p className="text-sm text-gray-600">Production System</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-malao-orange text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white">
          <div className="mb-4 px-4 py-2 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
}

