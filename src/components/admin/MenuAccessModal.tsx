import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Database } from '../../lib/database.types';
import { X, AlertCircle, CheckCircle } from 'lucide-react';

type Menu = Database['public']['Tables']['menus']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

interface MenuAccessModalProps {
  menu: Menu;
  onClose: () => void;
  onSuccess: () => void;
}

export function MenuAccessModal({ menu, onClose, onSuccess }: MenuAccessModalProps) {
  const { user } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [assignedUserIds, setAssignedUserIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [menu.id]);

  const fetchData = async () => {
    setLoading(true);

    const [usersResult, accessResult] = await Promise.all([
      supabase.from('profiles').select('*').order('full_name'),
      supabase.from('user_menus').select('user_id').eq('menu_id', menu.id),
    ]);

    if (usersResult.error) {
      setError('Failed to load users');
    } else {
      setUsers(usersResult.data || []);
    }

    if (accessResult.error) {
      setError('Failed to load menu access');
    } else {
      setAssignedUserIds(new Set(accessResult.data?.map(a => a.user_id) || []));
    }

    setLoading(false);
  };

  const toggleUserAccess = (userId: string) => {
    const newSet = new Set(assignedUserIds);
    if (newSet.has(userId)) {
      newSet.delete(userId);
    } else {
      newSet.add(userId);
    }
    setAssignedUserIds(newSet);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      const { error: deleteError } = await supabase
        .from('user_menus')
        .delete()
        .eq('menu_id', menu.id);

      if (deleteError) throw deleteError;

      if (assignedUserIds.size > 0) {
        const inserts = Array.from(assignedUserIds).map(userId => ({
          user_id: userId,
          menu_id: menu.id,
          granted_by: user?.id,
        }));

        const { error: insertError } = await supabase
          .from('user_menus')
          .insert(inserts);

        if (insertError) throw insertError;
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Manage Menu Access</h3>
            <p className="text-sm text-slate-600 mt-1">{menu.name}</p>
          </div>
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

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-300 border-t-slate-900"></div>
              <p className="mt-4 text-slate-600">Loading users...</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {users.map((user) => (
                <label
                  key={user.id}
                  className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={assignedUserIds.has(user.id)}
                    onChange={() => toggleUserAccess(user.id)}
                    className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-900"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{user.full_name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700 capitalize">
                    {user.role}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 p-6 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
