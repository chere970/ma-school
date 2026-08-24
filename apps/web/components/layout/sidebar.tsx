'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { Icons } from '@/components/ui/icons';

interface NavItem {
  name: string;
  href: string;
  icon: keyof typeof Icons;
  badge?: string;
  disabled?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { tenant, user } = useAuth();

  const navigation: NavSection[] = [
    {
      title: 'OVERVIEW',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: 'Dashboard' },
      ],
    },
    {
      title: 'ACADEMIC STRUCTURE',
      items: [
        { name: 'Campuses', href: '/academic/campuses', icon: 'Campus' },
        { name: 'Departments', href: '/academic/departments', icon: 'Department' },
        { name: 'Programs', href: '/academic/programs', icon: 'Program' },
        { name: 'Courses', href: '/academic/courses', icon: 'Course' },
      ],
    },
    {
      title: 'PEOPLE',
      items: [
        { name: 'Students', href: '/academic/students', icon: 'Student' },
        { name: 'Teachers', href: '/academic/teachers', icon: 'Teacher' },
      ],
    },
    {
      title: 'OPERATIONS',
      items: [
        { name: 'Enrollments', href: '/academic/enrollments', icon: 'Enrollment' },
        { name: 'Teaching Assignments', href: '/academic/teaching-assignments', icon: 'TeachingAssignment' },
        { name: 'Rooms', href: '/academic/rooms', icon: 'Room' },
        { name: 'Timetable', href: '/academic/timetable', icon: 'Timetable' },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        { name: 'Attendance', href: '#', icon: 'Check', disabled: true, badge: 'Soon' },
        { name: 'Grades & Assessment', href: '#', icon: 'Course', disabled: true, badge: 'Soon' },
      ],
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Icons.Program className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight leading-tight">
                CampusCore
              </h1>
              <span className="text-[10px] font-semibold tracking-wider text-indigo-400 uppercase">
                Enterprise ERP
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white lg:hidden"
          >
            <Icons.X className="w-5 h-5" />
          </button>
        </div>

        {/* Tenant Active Card */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
          <div className="px-3 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-950/80 border border-indigo-700/50 flex items-center justify-center text-indigo-400 font-bold text-xs">
              {tenant?.name ? tenant.name.substring(0, 2).toUpperCase() : 'CC'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-200 truncate">
                {tenant?.name || 'Institution Tenant'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {user?.role || 'SUPER_ADMIN'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
          {navigation.map((section) => (
            <div key={section.title}>
              <h2 className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                {section.title}
              </h2>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const IconComponent = Icons[item.icon] || Icons.Dashboard;
                  const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href) && item.href !== '#');

                  if (item.disabled) {
                    return (
                      <div
                        key={item.name}
                        className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium text-slate-600 cursor-not-allowed opacity-60"
                      >
                        <div className="flex items-center gap-3">
                          <IconComponent className="w-4 h-4" />
                          <span>{item.name}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-semibold">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => onClose()}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20 font-semibold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                        <span>{item.name}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer User Card */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-200 font-bold text-xs">
              {user?.firstName ? user.firstName[0] : 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-slate-200 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
