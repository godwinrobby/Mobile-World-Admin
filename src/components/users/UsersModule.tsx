import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { User, Role, UserPermissions } from '../../types';
import {
  Users,
  UserPlus,
  Shield,
  Key,
  Lock,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Search,
  Check,
  X,
  Smartphone,
  CreditCard,
  Package,
  Wrench,
  BookOpen,
  BarChart3,
  Settings as SettingsIcon,
  UserCheck,
  Copy,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

const DEFAULT_PERMISSIONS: Record<Role, UserPermissions> = {
  Admin: {
    posBilling: true,
    buyTradeIn: true,
    inventoryControl: true,
    repairJobs: true,
    udharLedger: true,
    reportsAnalytics: true,
    settingsConfig: true,
    userManagement: true
  },
  Manager: {
    posBilling: true,
    buyTradeIn: true,
    inventoryControl: true,
    repairJobs: true,
    udharLedger: true,
    reportsAnalytics: true,
    settingsConfig: false,
    userManagement: false
  },
  Cashier: {
    posBilling: true,
    buyTradeIn: false,
    inventoryControl: false,
    repairJobs: false,
    udharLedger: true,
    reportsAnalytics: false,
    settingsConfig: false,
    userManagement: false
  },
  'Sales Executive': {
    posBilling: true,
    buyTradeIn: true,
    inventoryControl: false,
    repairJobs: false,
    udharLedger: true,
    reportsAnalytics: false,
    settingsConfig: false,
    userManagement: false
  },
  'Repair Technician': {
    posBilling: false,
    buyTradeIn: false,
    inventoryControl: false,
    repairJobs: true,
    udharLedger: false,
    reportsAnalytics: false,
    settingsConfig: false,
    userManagement: false
  }
};

const PERMISSION_KEYS: { key: keyof UserPermissions; label: string; description: string; icon: any }[] = [
  { key: 'posBilling', label: 'POS Billing & Sales', description: 'Process cash, card, UPI counter sales and generate invoices', icon: CreditCard },
  { key: 'buyTradeIn', label: 'Buy & Device Valuation', description: 'Evaluate used smartphones and approve buy-back payouts', icon: Smartphone },
  { key: 'inventoryControl', label: 'Inventory & IMEI Control', description: 'Add/edit catalog products, variants, and serial/IMEI tags', icon: Package },
  { key: 'repairJobs', label: 'Repair Job Cards', description: 'Create repair entries, update job status, and assign technicians', icon: Wrench },
  { key: 'udharLedger', label: 'Udhar Khata & Credits', description: 'View customer credit accounts, record payments and balances', icon: BookOpen },
  { key: 'reportsAnalytics', label: 'Reports & Revenue Stats', description: 'Access profit analysis, GST ledgers, and sales reports', icon: BarChart3 },
  { key: 'settingsConfig', label: 'Store Settings & Gateways', description: 'Manage shop details, payment options, and invoice rules', icon: SettingsIcon },
  { key: 'userManagement', label: 'User & Permissions Admin', description: 'Create staff credentials, edit roles, and delete accounts', icon: Users }
];

export const UsersModule: React.FC = () => {
  const { users, addUser, updateUser, deleteUser, currentUser } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'users' | 'matrix' | 'pin-codes'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    username: string;
    email: string;
    password: string;
    pinCode: string;
    phone: string;
    role: Role;
    avatar: string;
    status: 'Active' | 'Suspended' | 'Inactive';
    permissions: UserPermissions;
  }>({
    name: '',
    username: '',
    email: '',
    password: 'password123',
    pinCode: '1234',
    phone: '',
    role: 'Cashier',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
    status: 'Active',
    permissions: { ...DEFAULT_PERMISSIONS['Cashier'] }
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
        user.phone.includes(searchTerm);

      const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'ALL' || (user.status || 'Active') === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter(u => (u.status || 'Active') === 'Active').length;
    const cashiers = users.filter(u => u.role === 'Cashier' || u.role === 'Sales Executive').length;
    const managers = users.filter(u => u.role === 'Manager').length;
    const admins = users.filter(u => u.role === 'Admin').length;
    const technicians = users.filter(u => u.role === 'Repair Technician').length;

    return { total, active, cashiers, managers, admins, technicians };
  }, [users]);

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      username: '',
      email: '',
      password: 'password123',
      pinCode: Math.floor(1000 + Math.random() * 9000).toString(),
      phone: '',
      role: 'Cashier',
      avatar: `https://images.unsplash.com/photo-${1535713875002 + Math.floor(Math.random() * 1000)}?auto=format&fit=crop&q=80&w=200`,
      status: 'Active',
      permissions: { ...DEFAULT_PERMISSIONS['Cashier'] }
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      username: user.username || user.email.split('@')[0],
      email: user.email,
      password: user.password || 'password123',
      pinCode: user.pinCode || '1234',
      phone: user.phone || '',
      role: user.role,
      avatar: user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      status: user.status || 'Active',
      permissions: user.permissions || { ...DEFAULT_PERMISSIONS[user.role] || DEFAULT_PERMISSIONS['Cashier'] }
    });
    setIsAddModalOpen(true);
  };

  const handleRoleChange = (selectedRole: Role) => {
    setFormData(prev => ({
      ...prev,
      role: selectedRole,
      permissions: { ...DEFAULT_PERMISSIONS[selectedRole] }
    }));
  };

  const handlePermissionToggle = (key: keyof UserPermissions) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: !prev.permissions[key]
      }
    }));
  };

  const handleSubmitUser = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      showToast('Please fill in Name and Email');
      return;
    }

    if (editingUser) {
      updateUser(editingUser.id, {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        pinCode: formData.pinCode,
        phone: formData.phone,
        role: formData.role,
        avatar: formData.avatar,
        status: formData.status,
        permissions: formData.permissions
      });
      showToast(`User ${formData.name} updated successfully!`);
    } else {
      addUser({
        name: formData.name,
        username: formData.username || formData.email.split('@')[0],
        email: formData.email,
        password: formData.password,
        pinCode: formData.pinCode,
        phone: formData.phone,
        role: formData.role,
        avatar: formData.avatar,
        status: formData.status,
        permissions: formData.permissions
      });
      showToast(`Staff member ${formData.name} added with ${formData.role} credentials!`);
    }

    setIsAddModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (!deletingUser) return;
    deleteUser(deletingUser.id);
    showToast(`Staff account for ${deletingUser.name} deleted.`);
    setDeletingUser(null);
  };

  const togglePasswordVisibility = (userId: string) => {
    setShowPasswords(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const getRoleBadgeColor = (role: Role) => {
    switch (role) {
      case 'Admin':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'Manager':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'Cashier':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Sales Executive':
        return 'bg-teal-500/20 text-teal-300 border-teal-500/30';
      case 'Repair Technician':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto text-slate-100">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-3 border border-slate-700 animate-bounce">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-bold text-white tracking-tight">Staff & Cashier Role Permissions</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Manage store employees, login credentials, POS access PINs, and granular feature authorizations
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-600/20 transition-all text-sm shrink-0 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Staff / Cashier</span>
        </button>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xs flex items-center space-x-3">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Total Staff</p>
            <p className="text-xl font-bold text-white">{stats.total}</p>
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xs flex items-center space-x-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Cashiers & Sales</p>
            <p className="text-xl font-bold text-white">{stats.cashiers}</p>
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xs flex items-center space-x-3">
          <div className="p-3 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Managers</p>
            <p className="text-xl font-bold text-white">{stats.managers}</p>
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xs flex items-center space-x-3">
          <div className="p-3 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Technicians</p>
            <p className="text-xl font-bold text-white">{stats.technicians}</p>
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xs flex items-center space-x-3 col-span-2 lg:col-span-1">
          <div className="p-3 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Administrators</p>
            <p className="text-xl font-bold text-white">{stats.admins}</p>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-800 space-x-8">
        <button
          onClick={() => setActiveSubTab('users')}
          className={`pb-3 text-sm font-medium flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'users'
              ? 'border-indigo-500 text-indigo-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Staff Accounts & Credentials ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('matrix')}
          className={`pb-3 text-sm font-medium flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'matrix'
              ? 'border-indigo-500 text-indigo-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Role Permission Matrix</span>
        </button>

        <button
          onClick={() => setActiveSubTab('pin-codes')}
          className={`pb-3 text-sm font-medium flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'pin-codes'
              ? 'border-indigo-500 text-indigo-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Cashier POS Quick PINs</span>
        </button>
      </div>

      {/* SUBTAB 1: STAFF ACCOUNTS TABLE */}
      {activeSubTab === 'users' && (
        <div className="space-y-4">
          {/* Filter & Search Bar */}
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search staff by name, email, username..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-950 border border-slate-800 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden placeholder-slate-500"
              />
            </div>

            <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="text-sm border border-slate-800 rounded-lg px-3 py-2 bg-slate-950 text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-hidden"
              >
                <option value="ALL">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Cashier">Cashier</option>
                <option value="Sales Executive">Sales Executive</option>
                <option value="Repair Technician">Repair Technician</option>
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="text-sm border border-slate-800 rounded-lg px-3 py-2 bg-slate-950 text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-hidden"
              >
                <option value="ALL">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* User List Table */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-3.5">Staff Member</th>
                    <th className="px-6 py-3.5">Role</th>
                    <th className="px-6 py-3.5">Credentials & PIN</th>
                    <th className="px-6 py-3.5">Permissions Granted</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-sm">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
                        <p className="font-medium text-slate-300">No staff accounts found</p>
                        <p className="text-xs text-slate-500 mt-1">Try resetting search filters or add a new staff member.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(user => {
                      const userPerms = user.permissions || DEFAULT_PERMISSIONS[user.role] || DEFAULT_PERMISSIONS['Cashier'];
                      const isSelf = currentUser?.id === user.id;

                      return (
                        <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                          {/* Staff Member Info */}
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-10 h-10 rounded-full object-cover border border-slate-700"
                              />
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="font-semibold text-white">{user.name}</span>
                                  {isSelf && (
                                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-sm">
                                      YOU
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-400">{user.email}</p>
                                <p className="text-xs text-slate-500">{user.phone}</p>
                              </div>
                            </div>
                          </td>

                          {/* Role */}
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(
                                user.role
                              )}`}
                            >
                              {user.role}
                            </span>
                          </td>

                          {/* Credentials & PIN */}
                          <td className="px-6 py-4">
                            <div className="space-y-1 font-mono text-xs">
                              <div className="flex items-center space-x-1.5 text-slate-200">
                                <span className="text-slate-500 font-sans">User:</span>
                                <span className="font-semibold">{user.username || user.email.split('@')[0]}</span>
                              </div>
                              <div className="flex items-center space-x-1.5 text-slate-200">
                                <span className="text-slate-500 font-sans">Pass:</span>
                                <span>{showPasswords[user.id] ? user.password || 'password123' : '••••••••'}</span>
                                <button
                                  type="button"
                                  onClick={() => togglePasswordVisibility(user.id)}
                                  className="text-slate-500 hover:text-slate-300 ml-1 cursor-pointer"
                                  title="Toggle password view"
                                >
                                  {showPasswords[user.id] ? (
                                    <EyeOff className="w-3.5 h-3.5" />
                                  ) : (
                                    <Eye className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                              <div className="flex items-center space-x-1.5 text-indigo-300">
                                <span className="text-slate-500 font-sans">POS PIN:</span>
                                <span className="bg-indigo-500/10 px-1.5 py-0.5 rounded-sm border border-indigo-500/20 font-bold">
                                  {user.pinCode || '1234'}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Permissions summary */}
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {PERMISSION_KEYS.map(pk => {
                                const allowed = userPerms[pk.key];
                                if (!allowed) return null;
                                return (
                                  <span
                                    key={pk.key}
                                    className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700"
                                    title={pk.description}
                                  >
                                    <Check className="w-3 h-3 text-emerald-400 mr-1" />
                                    {pk.label.split('&')[0].trim()}
                                  </span>
                                );
                              })}
                            </div>
                          </td>

                          {/* Status - Interactive Quick Toggle */}
                          <td className="px-6 py-4">
                            <button
                              type="button"
                              disabled={isSelf}
                              onClick={() => {
                                if (isSelf) return;
                                const newStatus = (user.status || 'Active') === 'Active' ? 'Inactive' : 'Active';
                                updateUser(user.id, { status: newStatus });
                                showToast(`Staff account for ${user.name} set to ${newStatus}`);
                              }}
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                                (user.status || 'Active') === 'Active'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                              } ${isSelf ? 'cursor-not-allowed opacity-80' : ''}`}
                              title={isSelf ? "Cannot deactivate your own logged-in session" : "Click to toggle Active / Inactive status"}
                            >
                              <span
                                className={`w-2 h-2 rounded-full mr-1.5 ${
                                  (user.status || 'Active') === 'Active' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                                }`}
                              />
                              {user.status || 'Active'}
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              {/* Quick Active / Inactive Toggle Switch */}
                              {!isSelf && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newStatus = (user.status || 'Active') === 'Active' ? 'Inactive' : 'Active';
                                    updateUser(user.id, { status: newStatus });
                                    showToast(`${user.name} is now ${newStatus}`);
                                  }}
                                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition cursor-pointer flex items-center gap-1 ${
                                    (user.status || 'Active') === 'Active'
                                      ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30'
                                      : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                  }`}
                                  title={(user.status || 'Active') === 'Active' ? "Deactivate Staff Account" : "Activate Staff Account"}
                                >
                                  {(user.status || 'Active') === 'Active' ? (
                                    <>
                                      <XCircle className="w-3.5 h-3.5 text-rose-400" />
                                      <span>Make Inactive</span>
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                                      <span>Make Active</span>
                                    </>
                                  )}
                                </button>
                              )}

                              <button
                                onClick={() => handleOpenEditModal(user)}
                                className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                title="Edit Credentials, Role & Permissions"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => setDeletingUser(user)}
                                disabled={isSelf}
                                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                  isSelf
                                    ? 'text-slate-600 cursor-not-allowed'
                                    : 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10'
                                }`}
                                title={isSelf ? "Cannot delete your own active account" : "Delete User Account"}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: ROLE PERMISSION MATRIX */}
      {activeSubTab === 'matrix' && (
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xs p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white">System Role Authorization Matrix</h3>
            <p className="text-sm text-slate-400">
              Review default privilege levels across store operations for standard personnel tiers.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-xs font-bold text-slate-300 uppercase">
                  <th className="p-4 w-1/3">System Feature Module</th>
                  <th className="p-4 text-center">Admin</th>
                  <th className="p-4 text-center">Manager</th>
                  <th className="p-4 text-center">Cashier</th>
                  <th className="p-4 text-center">Sales Exec</th>
                  <th className="p-4 text-center">Technician</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm">
                {PERMISSION_KEYS.map(pk => {
                  const Icon = pk.icon;
                  return (
                    <tr key={pk.key} className="hover:bg-slate-800/40">
                      <td className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-slate-800 rounded-lg text-slate-300 shrink-0 border border-slate-700">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-white">{pk.label}</p>
                            <p className="text-xs text-slate-400">{pk.description}</p>
                          </div>
                        </div>
                      </td>

                      {(['Admin', 'Manager', 'Cashier', 'Sales Executive', 'Repair Technician'] as Role[]).map(role => {
                        const isGranted = DEFAULT_PERMISSIONS[role][pk.key];
                        return (
                          <td key={role} className="p-4 text-center">
                            {isGranted ? (
                              <span className="inline-flex items-center justify-center p-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                                <Check className="w-4 h-4" />
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center p-1 bg-slate-800 text-slate-600 border border-slate-700 rounded-full">
                                <X className="w-4 h-4" />
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 3: CASHIER POS QUICK PINS */}
      {activeSubTab === 'pin-codes' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-indigo-400 text-sm font-medium">
                <Key className="w-4 h-4" />
                <span>Fast Counter Terminal Access</span>
              </div>
              <h3 className="text-xl font-bold mt-1 text-white">Cashier POS Security PINs</h3>
              <p className="text-slate-400 text-sm mt-1 max-w-xl">
                Cashiers can enter their 4-digit PIN directly at the billing terminal to log sales under their name without requiring a full re-login.
              </p>
            </div>
            <button
              onClick={handleOpenAddModal}
              className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-xl text-sm hover:bg-indigo-500 transition-all shrink-0 cursor-pointer shadow-md"
            >
              + Create Cashier PIN
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map(user => (
              <div key={user.id} className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-slate-700" />
                    <div>
                      <h4 className="font-bold text-white text-sm">{user.name}</h4>
                      <p className="text-xs text-slate-400">{user.role}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRoleBadgeColor(user.role)}`}>
                    {user.role}
                  </span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">POS Terminal PIN</p>
                    <p className="text-lg font-mono font-bold text-indigo-400 tracking-widest">{user.pinCode || '1234'}</p>
                  </div>
                  <button
                    onClick={() => handleOpenEditModal(user)}
                    className="text-xs font-medium text-slate-400 hover:text-indigo-400 underline cursor-pointer"
                  >
                    Change PIN
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADD / EDIT USER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-800 text-white">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {editingUser ? 'Edit Staff Credentials & Permissions' : 'Register New Staff / Cashier'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Set user login credentials, assign store role, and customize access authorizations
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitUser} className="p-6 space-y-6">
              {/* Profile Details */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-1">
                  1. Profile Information
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-hidden placeholder-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Mobile Phone *</label>
                    <input
                      type="text"
                      placeholder="+91 98765 00000"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-hidden placeholder-slate-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="cashier@mobileshop.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-hidden placeholder-slate-500"
                    />
                  </div>
                </div>
              </div>

              {/* Login Credentials & PIN */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-1">
                  2. Login Credentials & POS PIN
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Username</label>
                    <input
                      type="text"
                      placeholder="ramesh_cashier"
                      value={formData.username}
                      onChange={e => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-hidden font-mono placeholder-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Web Password</label>
                    <input
                      type="text"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-hidden font-mono placeholder-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-indigo-400 mb-1">4-Digit POS PIN</label>
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="1234"
                      value={formData.pinCode}
                      onChange={e => setFormData({ ...formData, pinCode: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-indigo-500/40 bg-indigo-950/40 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-hidden font-mono font-bold text-indigo-300 placeholder-slate-500"
                    />
                  </div>
                </div>
              </div>

              {/* Role Selection & Account Status */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-1">
                  3. System Role & Status
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">System Role</label>
                    <select
                      value={formData.role}
                      onChange={e => handleRoleChange(e.target.value as Role)}
                      className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-hidden"
                    >
                      <option value="Admin">Admin (Full Control)</option>
                      <option value="Manager">Manager (Operations & Sales)</option>
                      <option value="Cashier">Cashier (POS Counter & Udhar)</option>
                      <option value="Sales Executive">Sales Executive (Sales & Trade-in)</option>
                      <option value="Repair Technician">Repair Technician (Job Cards)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Account Status</label>
                    <select
                      value={formData.status}
                      onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-hidden"
                    >
                      <option value="Active">Active (Can Login)</option>
                      <option value="Suspended">Suspended (Login Blocked)</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Granular Permissions Toggles */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    4. Granular Permissions Customization
                  </h4>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, permissions: { ...DEFAULT_PERMISSIONS[formData.role] } })}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
                  >
                    Reset to {formData.role} Defaults
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {PERMISSION_KEYS.map(pk => {
                    const isChecked = formData.permissions[pk.key];
                    const Icon = pk.icon;

                    return (
                      <label
                        key={pk.key}
                        className={`flex items-start space-x-3 p-3 rounded-xl border transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-indigo-500/10 border-indigo-500/40 text-white'
                            : 'bg-slate-950/60 border-slate-800 opacity-70 text-slate-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handlePermissionToggle(pk.key)}
                          className="mt-0.5 rounded text-indigo-500 focus:ring-indigo-500 bg-slate-950 border-slate-700"
                        />
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <Icon className={`w-3.5 h-3.5 ${isChecked ? 'text-indigo-400' : 'text-slate-500'}`} />
                            <span className={`text-xs font-bold ${isChecked ? 'text-white' : 'text-slate-400'}`}>
                              {pk.label}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{pk.description}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {editingUser ? 'Save User Changes' : 'Create Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-800 text-white">
            <div className="flex items-center space-x-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-white">Delete Staff Account?</h3>
            </div>
            <p className="text-sm text-slate-300">
              Are you sure you want to delete <strong className="text-white">{deletingUser.name}</strong> ({deletingUser.role})?
              This action will revoke their login credentials and POS PIN access immediately.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-md cursor-pointer"
              >
                Yes, Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
