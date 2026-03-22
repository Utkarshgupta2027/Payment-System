import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

function CopyIdButton({ userId }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(String(userId));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      title="Copy your Payment ID"
      className="text-xs px-2 py-1 rounded-lg bg-primary-500/10 border border-primary-500/20 text-primary-400 hover:bg-primary-500/20 transition-all active:scale-95"
    >
      {copied ? '✅' : '📋'}
    </button>
  );
}

const navItems = [
  { path: '/dashboard', label: 'Dashboard',  icon: '🏠' },
  { path: '/send',      label: 'Send Money', icon: '💸' },
  { path: '/add-money', label: 'Add Money',  icon: '➕' },
  { path: '/history',   label: 'History',    icon: '📋' },
  { path: '/qr-code',   label: 'My QR Code', icon: '📱' },
  { path: '/scanner',   label: 'Scan & Pay', icon: '📷' },
];

export default function Sidebar({ onClose }) {
  const { user, logout }    = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate   = useNavigate();
  const location   = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavClick = () => {
    // On mobile, close the sidebar after navigation
    if (onClose) onClose();
  };

  return (
    <aside
      className={`flex flex-col h-screen sidebar-bg transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}
    >
      {/* ── Brand / Header ── */}
      <div className="flex items-center gap-3 px-4 py-5"
        style={{ borderBottom: '1px solid var(--border-color)' }}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-lg font-bold text-white shadow-lg shadow-primary-500/30 flex-shrink-0">
          ₹
        </div>
        {!collapsed && (
          <span className="font-bold text-lg bg-gradient-to-r from-primary-300 to-primary-500 bg-clip-text text-transparent">
            PayFlow
          </span>
        )}

        <div className="ml-auto flex items-center gap-1">
          {/* Collapse toggle — desktop only */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex p-1.5 rounded-lg transition-colors hover:opacity-70"
            style={{ color: 'var(--text-faint)' }}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {collapsed
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                : <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>}
            </svg>
          </button>
          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg transition-colors hover:opacity-70"
            style={{ color: 'var(--text-faint)' }}
            aria-label="Close menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── User info ── */}
      {!collapsed && user && (
        <div className="mx-3 mt-4 p-3 rounded-xl"
          style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500/30 to-primary-700/30 border border-primary-600/40 flex items-center justify-center text-sm font-bold text-primary-400 flex-shrink-0">
              {(user.name || user.email || 'U')[0].toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user.name || 'User'}</p>
              <p className="text-xs truncate" style={{ color: 'var(--text-faint)' }}>{user.email}</p>
            </div>
          </div>
          {/* Payment ID */}
          <div className="flex items-center justify-between rounded-lg px-2.5 py-1.5"
            style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)' }}>
            <div>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>Payment ID</p>
              <p className="text-sm font-bold text-primary-400">#{user.id}</p>
            </div>
            <CopyIdButton userId={user.id} />
          </div>
        </div>
      )}

      {/* ── Nav links ── */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ path, label, icon }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              onClick={handleNavClick}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200
                ${active
                  ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                  : 'hover:bg-primary-500/10'}`}
              style={!active ? { color: 'var(--text-muted)' } : {}}
            >
              <span className="text-lg flex-shrink-0">{icon}</span>
              {!collapsed && <span>{label}</span>}
              {active && !collapsed && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-400"/>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Bottom actions: theme toggle + logout ── */}
      <div className="p-3 space-y-1" style={{ borderTop: '1px solid var(--border-color)' }}>

        {/* 🌙 / ☀️ Theme toggle */}
        <button
          onClick={toggleTheme}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full transition-all duration-200 hover:bg-primary-500/10`}
          style={{ color: 'var(--text-muted)' }}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          <span className="text-lg flex-shrink-0">{isDark ? '☀️' : '🌙'}</span>
          {!collapsed && (
            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          )}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full transition-all duration-200 hover:bg-red-500/10 hover:text-red-400"
          style={{ color: 'var(--text-muted)' }}
        >
          <span className="text-lg flex-shrink-0">🚪</span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
