'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';
import { PageHeader } from '@/components/layout/page-header';
import { Icons } from '@/components/ui/icons';

import { campusesApi } from '@/lib/api/campuses';
import { departmentsApi } from '@/lib/api/departments';
import { programsApi } from '@/lib/api/programs';
import { coursesApi } from '@/lib/api/courses';
import { studentsApi } from '@/lib/api/students';
import { teachersApi } from '@/lib/api/teachers';
import { enrollmentsApi } from '@/lib/api/enrollments';
import { teachingAssignmentsApi } from '@/lib/api/teaching-assignments';

interface StatsState {
  campuses: number;
  departments: number;
  programs: number;
  courses: number;
  students: number;
  teachers: number;
  enrollments: number;
  assignments: number;
}

export default function DashboardPage() {
  const { user, tenant } = useAuth();
  const [stats, setStats] = useState<StatsState>({
    campuses: 0,
    departments: 0,
    programs: 0,
    courses: 0,
    students: 0,
    teachers: 0,
    enrollments: 0,
    assignments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        campuses,
        departments,
        programs,
        courses,
        students,
        teachers,
        enrollments,
        assignments,
      ] = await Promise.allSettled([
        campusesApi.getAll(),
        departmentsApi.getAll(),
        programsApi.getAll(),
        coursesApi.getAll(),
        studentsApi.getAll(),
        teachersApi.getAll(),
        enrollmentsApi.getAll(),
        teachingAssignmentsApi.getAll(),
      ]);

      setStats({
        campuses: campuses.status === 'fulfilled' ? campuses.value.length : 0,
        departments: departments.status === 'fulfilled' ? departments.value.length : 0,
        programs: programs.status === 'fulfilled' ? programs.value.length : 0,
        courses: courses.status === 'fulfilled' ? courses.value.length : 0,
        students: students.status === 'fulfilled' ? students.value.length : 0,
        teachers: teachers.status === 'fulfilled' ? teachers.value.length : 0,
        enrollments: enrollments.status === 'fulfilled' ? enrollments.value.length : 0,
        assignments: assignments.status === 'fulfilled' ? assignments.value.length : 0,
      });
    } catch {
      setError('Unable to load full dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const statCards = [
    { title: 'Total Students', value: stats.students, icon: 'Student', href: '/academic/students', color: 'from-blue-600 to-indigo-600' },
    { title: 'Total Faculty / Teachers', value: stats.teachers, icon: 'Teacher', href: '/academic/teachers', color: 'from-emerald-600 to-teal-600' },
    { title: 'Active Courses', value: stats.courses, icon: 'Course', href: '/academic/courses', color: 'from-purple-600 to-pink-600' },
    { title: 'Degree Programs', value: stats.programs, icon: 'Program', href: '/academic/programs', color: 'from-amber-600 to-orange-600' },
    { title: 'Academic Departments', value: stats.departments, icon: 'Department', href: '/academic/departments', color: 'from-cyan-600 to-blue-600' },
    { title: 'University Campuses', value: stats.campuses, icon: 'Campus', href: '/academic/campuses', color: 'from-rose-600 to-red-600' },
    { title: 'Course Enrollments', value: stats.enrollments, icon: 'Enrollment', href: '/academic/enrollments', color: 'from-violet-600 to-indigo-600' },
    { title: 'Teaching Assignments', value: stats.assignments, icon: 'TeachingAssignment', href: '/academic/teaching-assignments', color: 'from-indigo-600 to-blue-600' },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome back, ${user?.firstName || 'Admin'}`}
        description={`Institutional Overview for ${tenant?.name || 'Demo University'} — ERP Operations Control Panel`}
        action={
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
          >
            <Icons.RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
        }
      />

      {error && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm flex items-center gap-3">
          <Icons.AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => {
          const IconComponent = Icons[card.icon as keyof typeof Icons] || Icons.Dashboard;
          return (
            <Link key={card.title} href={card.href} className="group block">
              <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700/80 transition-all duration-200 shadow-xl relative overflow-hidden group-hover:-translate-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{card.title}</span>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${card.color} flex items-center justify-center shadow-md text-white`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline justify-between">
                  {loading ? (
                    <div className="h-8 w-16 bg-slate-800 rounded animate-pulse" />
                  ) : (
                    <span className="text-3xl font-extrabold text-white tracking-tight">{card.value}</span>
                  )}
                  <span className="text-xs text-indigo-400 font-medium group-hover:underline flex items-center gap-1">
                    Manage <Icons.ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Action Navigation Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">Academic Modules</h2>
              <p className="text-xs text-slate-400">Direct access to manage multi-tenant institution resources</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/academic/campuses" className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/40 transition-all group flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <Icons.Campus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-200 group-hover:text-indigo-400 transition-colors">Campuses</h3>
                <p className="text-xs text-slate-400 mt-0.5">Manage physical university campuses and locations</p>
              </div>
            </Link>

            <Link href="/academic/departments" className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/40 transition-all group flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Icons.Department className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-200 group-hover:text-indigo-400 transition-colors">Departments</h3>
                <p className="text-xs text-slate-400 mt-0.5">Academic departments mapped to specific campuses</p>
              </div>
            </Link>

            <Link href="/academic/programs" className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/40 transition-all group flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Icons.Program className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-200 group-hover:text-indigo-400 transition-colors">Degree Programs</h3>
                <p className="text-xs text-slate-400 mt-0.5">Bachelor, Master, and Doctorate degree curricula</p>
              </div>
            </Link>

            <Link href="/academic/courses" className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/40 transition-all group flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Icons.Course className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-200 group-hover:text-indigo-400 transition-colors">Course Catalog</h3>
                <p className="text-xs text-slate-400 mt-0.5">Syllabi, credit hours, year level, and prerequisites</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Operational System Context Card */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Multi-Tenant Architecture
            </div>
            <h2 className="text-base font-bold text-white mb-1">{tenant?.name || 'Demo University'}</h2>
            <p className="text-xs text-slate-400 mb-6">
              All API queries are automatically scoped using JWT tenant context (`AsyncLocalStorage`).
            </p>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Authenticated User</span>
                <span className="font-mono text-indigo-300 font-semibold">{user?.email}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Tenant Slug</span>
                <span className="font-mono text-slate-200 font-semibold">{tenant?.slug || 'demo-university'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Security Boundary</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <Icons.Shield className="w-3.5 h-3.5" /> Enforced
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80">
            <Link
              href="/academic/timetable"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 transition-all"
            >
              <Icons.Timetable className="w-4 h-4" />
              <span>Open Weekly Timetable Grid</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
