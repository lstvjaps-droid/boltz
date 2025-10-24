import { useState } from 'react';
import { DashboardLayout } from '../layout/DashboardLayout';
import { UserManagement } from './UserManagement';
import { MenuManagement } from './MenuManagement';
import { Users, Layout, BarChart3 } from 'lucide-react';

type Tab = 'overview' | 'users' | 'menus';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('users');

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === 'users'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Users className="w-5 h-5" />
              User Management
            </button>
            <button
              onClick={() => setActiveTab('menus')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === 'menus'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Layout className="w-5 h-5" />
              Menu Management
            </button>
          </div>
        </div>

        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'menus' && <MenuManagement />}
      </div>
    </DashboardLayout>
  );
}
