'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Icons } from '@/components/ui/icons';
import { Course, Department, Program } from '@/types/academic';
import { coursesApi, CreateCourseInput } from '@/lib/api/courses';
import { departmentsApi } from '@/lib/api/departments';
import { programsApi } from '@/lib/api/programs';
import { ApiClientError } from '@/lib/api/client';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);

  // Form
  const [formData, setFormData] = useState<CreateCourseInput>({
    departmentId: '',
    programId: '',
    code: '',
    name: '',
    description: '',
    creditHours: 3,
    semester: 1,
    yearLevel: 1,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [courseData, deptData, progData] = await Promise.all([
        coursesApi.getAll(),
        departmentsApi.getAll(),
        programsApi.getAll(),
      ]);
      setCourses(courseData);
      setDepartments(deptData);
      setPrograms(progData);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('Failed to fetch courses catalog.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      await coursesApi.create(formData);
      setIsCreateOpen(false);
      setFormData({
        departmentId: '',
        programId: '',
        code: '',
        name: '',
        description: '',
        creditHours: 3,
        semester: 1,
        yearLevel: 1,
      });
      fetchData();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setFormError(err.message);
      } else {
        setFormError('Failed to create course.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;
    setFormError(null);
    setSubmitting(true);
    try {
      await coursesApi.update(editingCourse.id, formData);
      setEditingCourse(null);
      fetchData();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setFormError(err.message);
      } else {
        setFormError('Failed to update course.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCourse) return;
    setSubmitting(true);
    try {
      await coursesApi.delete(deletingCourse.id);
      setDeletingCourse(null);
      fetchData();
    } catch (err) {
      if (err instanceof ApiClientError) {
        alert(`Delete failed: ${err.message}`);
      } else {
        alert('Failed to delete course.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const openCreateModal = () => {
    setFormData({
      departmentId: departments[0]?.id || '',
      programId: programs[0]?.id || '',
      code: '',
      name: '',
      description: '',
      creditHours: 3,
      semester: 1,
      yearLevel: 1,
    });
    setFormError(null);
    setIsCreateOpen(true);
  };

  const openEditModal = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      departmentId: course.departmentId,
      programId: course.programId || '',
      code: course.code,
      name: course.name,
      description: course.description || '',
      creditHours: course.creditHours,
      semester: course.semester || 1,
      yearLevel: course.yearLevel || 1,
    });
    setFormError(null);
  };

  const filteredCourses = courses.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      (c.department?.name && c.department.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Courses Catalog"
        description="Manage curriculum course offerings, credit hours, and academic levels"
        action={
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
          >
            <Icons.Plus className="w-4 h-4" />
            <span>Add Course</span>
          </button>
        }
      />

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
          <Icons.AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Table Container */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800/80 bg-slate-950/40 flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Icons.Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by course title or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <span className="text-xs text-slate-400">
            Total: <strong className="text-slate-200">{filteredCourses.length}</strong> courses
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-6">Code</th>
                <th className="py-3.5 px-6">Course Title</th>
                <th className="py-3.5 px-6">Department</th>
                <th className="py-3.5 px-6">Credits</th>
                <th className="py-3.5 px-6">Year / Sem</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 px-6"><div className="h-4 w-16 bg-slate-800 rounded" /></td>
                    <td className="py-4 px-6"><div className="h-4 w-40 bg-slate-800 rounded" /></td>
                    <td className="py-4 px-6"><div className="h-4 w-28 bg-slate-800 rounded" /></td>
                    <td className="py-4 px-6"><div className="h-4 w-10 bg-slate-800 rounded" /></td>
                    <td className="py-4 px-6"><div className="h-4 w-16 bg-slate-800 rounded" /></td>
                    <td className="py-4 px-6"><div className="h-4 w-12 bg-slate-800 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <Icons.Course className="w-10 h-10 mx-auto text-slate-700 mb-2" />
                    <p className="font-medium">No courses found</p>
                    <p className="text-[11px]">Click "Add Course" to add to the catalog.</p>
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6 font-mono font-semibold text-purple-400">{course.code}</td>
                    <td className="py-4 px-6 font-medium text-slate-100">{course.name}</td>
                    <td className="py-4 px-6 text-slate-300">{course.department?.name || 'Assigned Dept'}</td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold text-[11px]">
                        {course.creditHours} Credits
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-400">
                      Year {course.yearLevel || 1} • Sem {course.semester || 1}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(course)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Edit Course"
                      >
                        <Icons.Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingCourse(course)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Delete Course"
                      >
                        <Icons.Trash className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {(isCreateOpen || editingCourse) && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">
                {isCreateOpen ? 'Create New Course' : 'Edit Course'}
              </h3>
              <button
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingCourse(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <Icons.X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <Icons.AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={isCreateOpen ? handleCreateSubmit : handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Department *</label>
                  <select
                    required
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="" disabled>Select department...</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Program *</label>
                  <select
                    required
                    value={formData.programId}
                    onChange={(e) => setFormData({ ...formData, programId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="" disabled>Select program...</option>
                    {programs.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Course Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="CS101, ENG201..."
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Credit Hours *</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    required
                    value={formData.creditHours}
                    onChange={(e) => setFormData({ ...formData, creditHours: parseInt(e.target.value) || 3 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Course Title *</label>
                <input
                  type="text"
                  required
                  placeholder="Data Structures & Algorithms"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Year Level</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={formData.yearLevel}
                    onChange={(e) => setFormData({ ...formData, yearLevel: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Semester</label>
                  <input
                    type="number"
                    min={1}
                    max={3}
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setEditingCourse(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : isCreateOpen ? 'Create Course' : 'Update Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deletingCourse && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <Icons.Trash className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-white">Delete Course?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Are you sure you want to delete <strong className="text-slate-200">{deletingCourse.name}</strong>?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingCourse(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={submitting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-lg shadow-rose-600/25 disabled:opacity-50"
              >
                {submitting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
