import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getHistory } from '../api/api';

function StatCard({ label, value, icon, gradient }) {
  return (
    <div className={`rounded-2xl p-5 border border-white/10 shadow-xl relative overflow-hidden ${gradient}`}>
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/5 -translate-y-8 translate-x-8" />
      <p className="text-sm font-medium text-white/70 mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      <div className="absolute bottom-3 right-4 text-3xl opacity-40">{icon}</div>
    </div>
  );
}

function ActionButton({ to, icon, label, color }) {
  return (
    <Link
      to={to}
      className={`flex flex-col items-center gap-2 p-5 rounded-2xl border transition-all duration-200 hover:scale-105 active:scale-95 ${color}`}
    >
      <span className="text-3xl">{icon}</span>
      <span className="text-sm font-semibold text-white">{label}</span>
    </Link>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [recent, setRecent]   = useState([]);
  const [totalTx, setTotalTx] = useState(0);
  const [copied, setCopied]   = useState(false);

  useEffect(() => {
    if (user?.id) {
      getHistory(user.id)
        .then((r) => {
          setTotalTx(r.data.length);
          setRecent(r.data.slice(0, 5));
        })
        .catch(() => {});
    }
  }, [user]);

  const balance = user?.balance ?? '—';
  const displayName = user?.name || user?.email || 'User';

  const copyId = () => {
    navigator.clipboard.writeText(String(user?.id));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto animate-fade-in">
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-base-primary">
          Hello, {displayName.split(' ')[0]} 👋
        </h1>
        <p className="text-base-muted mt-1">Here's your financial overview</p>
      </div>

      {/* ── Your Payment ID ── */}
      <div className="mb-6 flex flex-wrap sm:flex-nowrap items-center gap-4 p-4 rounded-2xl border border-primary-500/30 shadow-lg" style={{ background: 'var(--bg-surface)' }}>
        <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center text-primary-400 text-xl flex-shrink-0">
          🪪
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-base-faint uppercase tracking-widest font-medium mb-0.5">Your Payment ID</p>
          <p className="text-2xl font-bold text-primary-400 tracking-widest">#{user?.id ?? '—'}</p>
          <p className="text-xs text-base-faint mt-0.5">Share this ID so others can send you money</p>
        </div>
        <button
          onClick={copyId}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500/15 border border-primary-500/30 text-primary-400 text-sm font-medium hover:bg-primary-500/25 active:scale-95 transition-all duration-200 flex-shrink-0"
        >
          {copied ? '✅ Copied!' : '📋 Copy ID'}
        </button>
      </div>

      {/* Balance + Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Wallet Balance"
          value={`₹ ${balance}`}
          icon="💰"
          gradient="bg-gradient-to-br from-primary-600 to-primary-800"
        />
        <StatCard
          label="Transactions"
          value={totalTx}
          icon="📊"
          gradient="bg-gradient-to-br from-slate-700 to-slate-800"
        />
        <StatCard
          label="Account Status"
          value="Active"
          icon="✅"
          gradient="bg-gradient-to-br from-emerald-700 to-emerald-900"
        />
      </div>

      {/* Quick Actions */}
      <div className="card mb-8">
        <h2 className="text-lg font-semibold text-base-primary mb-5">Quick Actions</h2>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          <ActionButton to="/send"      icon="💸" label="Send Money"  color="bg-gradient-to-br from-primary-600/30 to-primary-800/30 border-primary-600/30 hover:border-primary-500/60" />
          <ActionButton to="/add-money" icon="➕" label="Add Money"   color="bg-gradient-to-br from-emerald-600/30 to-emerald-800/30 border-emerald-600/30 hover:border-emerald-500/60" />
          <ActionButton to="/history"   icon="📋" label="History"     color="bg-gradient-to-br from-violet-600/30 to-violet-800/30 border-violet-600/30 hover:border-violet-500/60" />
          <ActionButton to="/qr-code"   icon="📱" label="My QR"       color="bg-gradient-to-br from-amber-600/30 to-amber-800/30 border-amber-600/30 hover:border-amber-500/60" />
          <ActionButton to="/scanner"   icon="📷" label="Scan & Pay"  color="bg-gradient-to-br from-sky-600/30 to-sky-800/30 border-sky-600/30 hover:border-sky-500/60" />
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-base-primary">Recent Transactions</h2>
          <Link to="/history" className="text-sm text-primary-400 hover:text-primary-300 transition-colors">
            View all →
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="text-center py-10 text-base-faint">
            <div className="text-5xl mb-3">📭</div>
            <p>No transactions yet</p>
            <Link to="/send" className="mt-3 inline-block text-primary-400 text-sm hover:text-primary-300">
              Send your first payment →
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {recent.map((tx) => (
              <li key={tx.id} className="flex items-center justify-between p-3 rounded-xl border" style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary-500/20 flex items-center justify-center text-lg">💸</div>
                  <div>
                    <p className="text-sm font-medium text-base-primary">To: User #{tx.receiverId}</p>
                    <p className="text-xs text-base-faint">{new Date(tx.time).toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-red-400">-₹{tx.amount}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${tx.status === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {tx.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
