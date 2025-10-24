import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Database } from '../../lib/database.types';
import { X, AlertCircle } from 'lucide-react';

type Menu = Database['public']['Tables']['menus']['Row'];

interface MenuModalProps {
  menu: Menu | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function MenuModal({ menu, onClose, onSuccess }: MenuModalProps) {
  const { user } = useAuth();
  const [name, setName] = useState(menu?.name || '');
  const [description, setDescription] = useState(menu?.description || '');
  const [icon, setIcon] = useState(menu?.icon || 'Layout');
  const [route, setRoute] = useState(menu?.route || '');
  const [orderIndex, setOrderIndex] = useState(menu?.order_index || 0);
  const [isActive, setIsActive] = useState(menu?.is_active ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (menu) {
      setName(menu.name);
      setDescription(menu.description || '');
      setIcon(menu.icon);
      setRoute(menu.route);
      setOrderIndex(menu.order_index);
      setIsActive(menu.is_active);
    }
  }, [menu]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (menu) {
        const { error: updateError } = await supabase
          .from('menus')
          .update({
            name,
            description,
            icon,
            route,
            order_index: orderIndex,
            is_active: isActive,
          })
          .eq('id', menu.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('menus')
          .insert({
            name,
            description,
            icon,
            route,
            order_index: orderIndex,
            is_active: isActive,
            created_by: user?.id,
          });

        if (insertError) throw insertError;
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h3 className="text-xl font-bold text-slate-900">
            {menu ? 'Edit Menu' : 'Add New Menu'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Menu Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              placeholder="Dashboard"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              placeholder="Optional description"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Route
            </label>
            <input
              type="text"
              value={route}
              onChange={(e) => setRoute(e.target.value)}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              placeholder="/dashboard"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Icon Name
            </label>
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              placeholder="Layout"
            />
            <p className="mt-1 text-xs text-slate-500">Use Lucide icon names</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Display Order
            </label>
            <input
              type="number"
              value={orderIndex}
              onChange={(e) => setOrderIndex(parseInt(e.target.value))}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              min="0"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-900"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
              Active
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : menu ? 'Update Menu' : 'Create Menu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
