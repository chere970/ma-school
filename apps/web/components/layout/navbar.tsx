'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { Icons } from '@/components/ui/icons';

export function Navbar({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const { user, tenant, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded-xl bg-slate-800/60 text-slate-300 hover:text-white lg:hidden border border-slate-700/50"
        >
          <Icons.Menu className="w-5 h-5" />
        </button>

        {/* Tenant context pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/50 text-xs text-slate-300">
          <Icons.Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-medium text-slate-200">
            {tenant?.name || 'Demo University'}
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400 text-[11px] font-mono">Tenant Isolation</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* User Role Badge */}
        <div className="hidden md:flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold">
            {user?.role || 'SUPER_ADMIN'}
          </span>
        </div>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-800/60 border border-transparent hover:border-slate-700/50 transition-all cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
              {user?.firstName ? user.firstName[0] : 'A'}
            </div>
            <span className="hidden sm:inline-block text-xs font-semibold text-slate-200">
              {user?.firstName} {user?.lastName}
            </span>
            <Icons.ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 divide-y divide-slate-800">
                <div className="px-4 py-2.5">
                  <p className="text-xs font-semibold text-slate-200">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-medium text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Icons.LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
