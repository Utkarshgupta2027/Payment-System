import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--bg-base)' }}>

      {/* ── Mobile overlay backdrop ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <div className={`
        fixed inset-y-0 left-0 z-30 transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto flex flex-col min-w-0">
        {/* Mobile top-bar */}
        <div className="flex items-center gap-3 px-4 py-3 md:hidden sticky top-0 z-10 shadow-sm"
          style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl transition-colors hover:opacity-70"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Open menu"
          >
            {/* Hamburger icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-sm font-bold text-white shadow">
              ₹
            </div>
            <span className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>PayFlow</span>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
