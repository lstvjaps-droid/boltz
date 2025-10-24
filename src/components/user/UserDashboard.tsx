import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardLayout } from '../layout/DashboardLayout';
import { Database } from '../../lib/database.types';
import { ProfileEdit } from './ProfileEdit';
import { Layout, User, AlertCircle } from 'lucide-react';

type Menu = Database['public']['Tables']['menus']['Row'];

export function UserDashboard() {
  const { user, profile } = useAuth();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<string>('welcome');

  useEffect(() => {
    fetchUserMenus();
  }, [user]);

  const fetchUserMenus = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('user_menus')
      .select('menu_id, menus(*)')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching user menus:', error);
    } else {
      const menuItems = data?.map(item => item.menus).filter(Boolean) as Menu[];
      setMenus(menuItems.filter(m => m.is_active).sort((a, b) => a.order_index - b.order_index));
    }
    setLoading(false);
  };

  return (
    <DashboardLayout title="User Dashboard">
      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sticky top-6">
            <h3 className="font-semibold text-slate-900 mb-4">Navigation</h3>
            <nav className="space-y-2">
              <button
                onClick={() => setSelectedView('welcome')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  selectedView === 'welcome'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Layout className="w-4 h-4" />
                Welcome
              </button>
              <button
                onClick={() => setSelectedView('profile')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  selectedView === 'profile'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <User className="w-4 h-4" />
                Edit Profile
              </button>
            </nav>

            {menus.length > 0 && (
              <>
                <div className="border-t border-slate-200 my-4"></div>
                <h3 className="font-semibold text-slate-900 mb-4 text-sm">Assigned Menus</h3>
                <nav className="space-y-2">
                  {menus.map((menu) => (
                    <button
                      key={menu.id}
                      onClick={() => setSelectedView(menu.id)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                        selectedView === menu.id
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Layout className="w-4 h-4" />
                      {menu.name}
                    </button>
                  ))}
                </nav>
              </>
            )}
          </div>
        </div>

        <div className="lg:col-span-3">
          {selectedView === 'welcome' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                Welcome, {profile?.full_name}!
              </h2>
              <p className="text-slate-600 mb-6">
                This is your personal dashboard. You can access your assigned menus and manage your profile.
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <p className="text-sm text-slate-600 mb-1">Email</p>
                  <p className="font-medium text-slate-900">{profile?.email}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <p className="text-sm text-slate-600 mb-1">Role</p>
                  <p className="font-medium text-slate-900 capitalize">{profile?.role}</p>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-300 border-t-slate-900"></div>
                  <p className="mt-4 text-slate-600">Loading your menus...</p>
                </div>
              ) : menus.length > 0 ? (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Your Assigned Menus</h3>
                  <div className="grid gap-3">
                    {menus.map((menu) => (
                      <div
                        key={menu.id}
                        className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-3">
                          <div className="bg-slate-100 p-2 rounded-lg">
                            <Layout className="w-5 h-5 text-slate-700" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-slate-900">{menu.name}</h4>
                            {menu.description && (
                              <p className="text-sm text-slate-600 mt-1">{menu.description}</p>
                            )}
                            <p className="text-xs text-slate-500 mt-2">Route: {menu.route}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-900">No menus assigned</p>
                    <p className="text-sm text-amber-800 mt-1">
                      Contact your administrator to get access to menus.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedView === 'profile' && <ProfileEdit />}

          {menus.find(m => m.id === selectedView) && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                {menus.find(m => m.id === selectedView)?.name}
              </h2>
              <p className="text-slate-600">
                {menus.find(m => m.id === selectedView)?.description ||
                 'This menu section is available to you.'}
              </p>
              <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="text-sm text-slate-600">
                  Content for this menu would be displayed here.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
