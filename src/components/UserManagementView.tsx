import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  DatabaseRole,
  ManagedUser,
  listActiveDatabaseMarkets,
  listManageableUsers,
  manageUserRole,
  manageUserStatus,
} from '../services/backendService';

interface DbMarket {
  id: string;
  name: string;
  city: string;
  state: string;
}

export const UserManagementView: React.FC = () => {
  const { currentRole, currentProfile, setActiveView, addToast } = useApp();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [markets, setMarkets] = useState<DbMarket[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [draftRoles, setDraftRoles] = useState<Record<string, Exclude<DatabaseRole, 'super_admin'>>>({});
  const [draftMarkets, setDraftMarkets] = useState<Record<string, string[]>>({});

  const load = async () => {
    if (currentRole !== 'super_admin') return;
    setLoading(true);
    try {
      const [userRows, marketRows] = await Promise.all([
        listManageableUsers(),
        listActiveDatabaseMarkets(),
      ]);
      setUsers(userRows);
      setMarkets(marketRows);
      setDraftRoles(Object.fromEntries(
        userRows
          .filter((user) => user.role !== 'super_admin')
          .map((user) => [user.id, user.role as Exclude<DatabaseRole, 'super_admin'>])
      ));
      setDraftMarkets(Object.fromEntries(
        userRows.map((user) => [user.id, user.agent?.assigned_market_ids || []])
      ));
    } catch (error: any) {
      addToast(error?.message || 'Could not load registered users.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [currentRole]);

  const visibleUsers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return users;
    return users.filter((user) =>
      `${user.full_name} ${user.email || ''} ${user.role}`.toLowerCase().includes(normalized)
    );
  }, [users, query]);

  if (currentRole !== 'super_admin') {
    return (
      <div className="max-w-xl mx-auto py-20 text-center">
        <ShieldCheck className="w-10 h-10 mx-auto text-[#a56800] mb-3" />
        <h1 className="text-xl font-bold">Super-admin access required</h1>
        <p className="text-sm text-[#6e7a70] dark:text-[#bdcabe] mt-2">
          User roles and field-agent access can only be managed by the MarketPulse super admin.
        </p>
      </div>
    );
  }

  const toggleMarket = (userId: string, marketId: string) => {
    setDraftMarkets((prev) => {
      const current = prev[userId] || [];
      return {
        ...prev,
        [userId]: current.includes(marketId)
          ? current.filter((id) => id !== marketId)
          : [...current, marketId],
      };
    });
  };

  const saveAccess = async (user: ManagedUser) => {
    if (user.role === 'super_admin' || user.id === currentProfile?.id) return;
    const newRole = draftRoles[user.id] || 'public_user';
    if (newRole !== 'public_user' && !user.email_confirmed_at) {
      addToast('This user must confirm their email before staff access can be granted.', 'warning');
      return;
    }
    if (newRole === 'field_agent' && (draftMarkets[user.id] || []).length === 0) {
      addToast('Assign at least one market before making this user a field agent.', 'warning');
      return;
    }

    setSavingUserId(user.id);
    try {
      await manageUserRole({
        targetUserId: user.id,
        newRole,
        assignedMarketIds: newRole === 'field_agent' ? draftMarkets[user.id] || [] : null,
      });
      addToast(`${user.full_name || user.email} is now ${roleLabel(newRole)}.`, 'success');
      await load();
    } catch (error: any) {
      addToast(error?.message || 'Could not update this user’s access.', 'error');
    } finally {
      setSavingUserId(null);
    }
  };

  const toggleStatus = async (user: ManagedUser) => {
    if (user.role === 'super_admin' || user.id === currentProfile?.id) return;
    setSavingUserId(user.id);
    try {
      await manageUserStatus(user.id, !user.is_active);
      addToast(`${user.full_name || user.email} is now ${user.is_active ? 'deactivated' : 'active'}.`, 'success');
      await load();
    } catch (error: any) {
      addToast(error?.message || 'Could not change account status.', 'error');
    } finally { setSavingUserId(null); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            onClick={() => setActiveView('admin-overview')}
            className="p-2 rounded-full hover:bg-[#eff4ff] dark:hover:bg-[#25344a]"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">User & Access Management</h1>
            <p className="text-xs text-[#6e7a70] dark:text-[#bdcabe] mt-1">
              Only you can appoint field agents or verifier/admin accounts.
            </p>
          </div>
        </div>
        <button
          onClick={() => void load()}
          className="px-4 py-2 rounded-xl border border-[#bdcabe]/50 dark:border-[#2d3e58] text-xs font-bold flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <Stat icon={<Users className="w-5 h-5" />} label="Registered users" value={users.length} />
        <Stat icon={<UserCheck className="w-5 h-5" />} label="Field agents" value={users.filter((u) => u.role === 'field_agent').length} />
        <Stat icon={<ShieldCheck className="w-5 h-5" />} label="Verifier/admins" value={users.filter((u) => u.role === 'verifier_admin').length} />
      </div>

      <div className="bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] rounded-2xl p-3 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6e7a70]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search registered users by name or email…"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#f8f9ff] dark:bg-[#121c2a] border border-[#bdcabe]/40 dark:border-[#2d3e58] text-sm focus:outline-none focus:ring-2 focus:ring-[#008751]"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm text-[#6e7a70]">Loading registered users…</div>
      ) : visibleUsers.length === 0 ? (
        <div className="py-16 text-center text-sm text-[#6e7a70]">No matching users found.</div>
      ) : (
        <div className="space-y-4">
          {visibleUsers.map((user) => {
            const isOwner = user.role === 'super_admin';
            const selectedRole = isOwner ? 'super_admin' : (draftRoles[user.id] || user.role);
            const isConfirmed = Boolean(user.email_confirmed_at);
            const initials = user.full_name
              ? user.full_name.split(/\s+/).slice(0,2).map((part) => part[0]).join('').toUpperCase()
              : (user.email || 'U').slice(0,2).toUpperCase();

            return (
              <div key={user.id} className="bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] rounded-3xl p-5 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-start gap-5">
                  <div className="flex items-center gap-3 md:w-64 shrink-0">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.full_name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#008751]/10 text-[#006b3f] flex items-center justify-center font-bold">{initials}</div>
                    )}
                    <div className="min-w-0">
                      <p className="font-bold text-sm truncate">{user.full_name || 'Unnamed user'}</p>
                      <p className="text-xs text-[#6e7a70] dark:text-[#bdcabe] truncate">{user.email}</p>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${isConfirmed ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'}`}>
                          {isConfirmed ? 'Identity confirmed' : 'Email unconfirmed'}
                        </span>
                        <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#eff4ff] dark:bg-[#25344a] text-[#3e4a41] dark:text-[#dce2f9]">
                          {user.auth_provider === 'google' ? 'Google' : 'Email'}
                        </span>
                      </div>
                      <p className="text-[11px] mt-1 text-[#6e7a70]">Joined {formatDate(user.created_at)}</p>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    {isOwner ? (
                      <div className="rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900 p-4 flex items-start gap-3">
                        <ShieldCheck className="w-5 h-5 text-purple-600 shrink-0" />
                        <div>
                          <p className="text-sm font-bold">Super Admin</p>
                          <p className="text-xs text-[#6e7a70] dark:text-[#bdcabe] mt-1">
                            This protected owner role cannot be changed from the application.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <label className="space-y-1.5">
                            <span className="text-xs font-bold uppercase tracking-wide text-[#6e7a70]">Access role</span>
                            <select
                              value={selectedRole}
                              onChange={(e) => setDraftRoles((prev) => ({ ...prev, [user.id]: e.target.value as Exclude<DatabaseRole,'super_admin'> }))}
                              disabled={!isConfirmed}
                              className="w-full rounded-xl border border-[#bdcabe]/50 dark:border-[#2d3e58] bg-[#f8f9ff] dark:bg-[#121c2a] px-3 py-2.5 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              <option value="public_user">Consumer / Public user</option>
                              <option value="field_agent">Field agent</option>
                              <option value="verifier_admin">Verifier / Admin</option>
                            </select>
                          </label>
                          <div className="rounded-xl bg-[#f8f9ff] dark:bg-[#121c2a] border border-[#bdcabe]/30 dark:border-[#2d3e58] p-3">
                            <p className="text-xs font-bold">Current status</p>
                            <p className="text-xs text-[#6e7a70] mt-1">{roleLabel(user.role)} · {user.is_active ? 'Active' : 'Inactive'}</p>
                          </div>
                        </div>

                        {!isConfirmed && (
                          <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 px-3 py-2.5 text-xs text-amber-800 dark:text-amber-200">
                            Staff access is locked until this user confirms their email address.
                          </div>
                        )}

                        {selectedRole === 'field_agent' && isConfirmed && (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <MapPin className="w-4 h-4 text-[#008751]" />
                              <p className="text-xs font-bold uppercase tracking-wide text-[#6e7a70]">Assigned markets</p>
                            </div>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                              {markets.map((market) => {
                                const checked = (draftMarkets[user.id] || []).includes(market.id);
                                return (
                                  <label key={market.id} className={`p-3 rounded-xl border cursor-pointer flex items-start gap-2 ${checked ? 'border-[#008751] bg-[#008751]/5' : 'border-[#bdcabe]/40 dark:border-[#2d3e58]'}`}>
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => toggleMarket(user.id, market.id)}
                                      className="mt-0.5 accent-[#008751]"
                                    />
                                    <span>
                                      <span className="block text-xs font-bold">{market.name}</span>
                                      <span className="block text-[11px] text-[#6e7a70]">{market.city}</span>
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <div className="flex flex-wrap justify-end gap-2">
                          <button
                            onClick={() => void toggleStatus(user)}
                            disabled={savingUserId === user.id}
                            className={`px-4 py-2.5 rounded-xl border text-xs font-bold disabled:opacity-50 ${user.is_active ? 'border-rose-300 text-rose-600' : 'border-emerald-300 text-emerald-700'}`}
                          >
                            {user.is_active ? 'Deactivate account' : 'Reactivate account'}
                          </button>
                          <button
                            onClick={() => void saveAccess(user)}
                            disabled={savingUserId === user.id || !user.is_active || !isConfirmed}
                            className="px-4 py-2.5 rounded-xl bg-[#008751] hover:bg-[#006b3f] text-white text-xs font-bold flex items-center gap-2 disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            {savingUserId === user.id ? 'Saving…' : 'Save Access'}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const Stat: React.FC<{icon:React.ReactNode;label:string;value:number}> = ({ icon, label, value }) => (
  <div className="bg-white dark:bg-[#182232] border border-[#bdcabe]/40 dark:border-[#2d3e58] rounded-2xl p-4 shadow-sm flex items-center gap-3">
    <div className="w-10 h-10 rounded-xl bg-[#008751]/10 text-[#008751] flex items-center justify-center">{icon}</div>
    <div><p className="text-xl font-bold">{value}</p><p className="text-xs text-[#6e7a70]">{label}</p></div>
  </div>
);

const roleLabel = (role: DatabaseRole) =>
  role === 'super_admin' ? 'Super Admin' :
  role === 'verifier_admin' ? 'Verifier / Admin' :
  role === 'field_agent' ? 'Field Agent' : 'Consumer';

const formatDate = (value?: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
};
