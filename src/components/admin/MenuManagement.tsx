import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Database } from '../../lib/database.types';
import { Layout, Plus, Edit2, Trash2, Users as UsersIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { MenuModal } from './MenuModal';
import { MenuAccessModal } from './MenuAccessModal';

type Menu = Database['public']['Tables']['menus']['Row'];

export function MenuManagement() {
  const { user } = useAuth();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('menus')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching menus:', error);
      showMessage('error', 'Failed to load menus');
    } else {
      setMenus(data || []);
    }
    setLoading(false);
  };

  const deleteMenu = async (menuId: string) => {
    if (!confirm('Are you sure you want to delete this menu?')) return;

    const { error } = await supabase
      .from('menus')
      .delete()
      .eq('id', menuId);

    if (error) {
      showMessage('error', 'Failed to delete menu');
    } else {
      showMessage('success', 'Menu deleted successfully');
      fetchMenus();
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 p-3 rounded-lg">
            <Layout className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Menu Management</h2>
            <p className="text-slate-600 text-sm">Create and manage navigation menus</p>
          </div>
        </div>
        <button
          onClick={() => {
            setSelectedMenu(null);
            setShowMenuModal(true);
          }}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Menu
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          <p className={`text-sm ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
            {message.text}
          </p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-300 border-t-slate-900"></div>
            <p className="mt-4 text-slate-600">Loading menus...</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {menus.map((menu) => (
              <div
                key={menu.id}
                className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-slate-100 p-2 rounded-lg">
                        <Layout className="w-5 h-5 text-slate-700" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{menu.name}</h3>
                        <p className="text-sm text-slate-500">{menu.route}</p>
                      </div>
                    </div>
                    {menu.description && (
                      <p className="text-sm text-slate-600 mt-2">{menu.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-xs text-slate-500">Order: {menu.order_index}</span>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          menu.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {menu.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedMenu(menu);
                        setShowAccessModal(true);
                      }}
                      className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Manage user access"
                    >
                      <UsersIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedMenu(menu);
                        setShowMenuModal(true);
                      }}
                      className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit menu"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteMenu(menu.id)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete menu"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {menus.length === 0 && (
              <div className="text-center py-12">
                <Layout className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">No menus created yet</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showMenuModal && (
        <MenuModal
          menu={selectedMenu}
          onClose={() => {
            setShowMenuModal(false);
            setSelectedMenu(null);
          }}
          onSuccess={() => {
            fetchMenus();
            showMessage('success', selectedMenu ? 'Menu updated successfully' : 'Menu created successfully');
          }}
        />
      )}

      {showAccessModal && selectedMenu && (
        <MenuAccessModal
          menu={selectedMenu}
          onClose={() => {
            setShowAccessModal(false);
            setSelectedMenu(null);
          }}
          onSuccess={() => {
            showMessage('success', 'User access updated successfully');
          }}
        />
      )}
    </div>
  );
}
