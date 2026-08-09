import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, Role } from '../../types';
import { ShieldCheck, UserCheck, KeyRound, Smartphone, Sparkles, CheckCircle2 } from 'lucide-react';

export const LoginModal: React.FC = () => {
  const { users, setCurrentUser } = useApp();
  const [selectedRole, setSelectedRole] = useState<Role>('Admin');
  const [email, setEmail] = useState('admin@mobileshop.com');
  const [password, setPassword] = useState('admin123');

  const handleQuickRoleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase()) || users[0];
    setCurrentUser(found);
  };

  return (
    <div id="login-modal-overlay" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div id="login-modal-card" className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 text-slate-100 overflow-hidden relative">
        
        {/* Background Accent Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/30">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Mobile Shop Admin Portal</h2>
          <p className="text-xs text-slate-400">
            Demo Portal with full POS, Trade-In, Ecommerce & Ledger access
          </p>
        </div>

        {/* Quick Demo Logins Section */}
        <div className="space-y-3 mb-6">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-left flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Select Demo Role to Sign In:</span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {users.map((u) => (
              <button
                key={u.id}
                id={`demo-user-login-${u.role.replace(/\s+/g, '-').toLowerCase()}`}
                onClick={() => handleQuickRoleLogin(u)}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-indigo-500/50 transition text-left group"
              >
                <div className="flex items-center gap-3">
                  <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-lg object-cover border border-slate-600" />
                  <div>
                    <div className="text-sm font-semibold text-slate-200 group-hover:text-indigo-300 transition">{u.name}</div>
                    <div className="text-xs text-slate-400">{u.email}</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    u.role === 'Admin' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                    u.role === 'Manager' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                    'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {u.role}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Traditional Form Option */}
        <form onSubmit={handleCustomLogin} className="pt-4 border-t border-slate-800 space-y-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-left">
            Or Login with Credentials:
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800 text-sm text-slate-100 px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-800 text-sm text-slate-100 px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <button
            type="submit"
            id="login-submit-btn"
            className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-medium text-sm py-2.5 rounded-xl shadow-md transition"
          >
            Enter Demo Admin Console
          </button>
        </form>

      </div>
    </div>
  );
};
