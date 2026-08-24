'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Icons } from '@/components/ui/icons';
import { Teacher, Department } from '@/types/academic';
import { teachersApi, CreateTeacherInput } from '@/lib/api/teachers';
import { departmentsApi } from '@/lib/api/departments';
import { ApiClientError } from '@/lib/api/client';

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [deletingTeacher, setDeletingTeacher] = useState<Teacher | null>(null);

  // Form
  const [formData, setFormData] = useState<CreateTeacherInput>({
    employeeNumber: '',
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phone: '',
    specialization: '',
    departmentId: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [teacherData, deptData] = await Promise.all([
        teachersApi.getAll(),
        departmentsApi.getAll(),
      ]);
      setTeachers(teacherData);
      setDepartments(deptData);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('Failed to fetch faculty directory.');
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
      await teachersApi.create(formData);
      setIsCreateOpen(false);
      fetchData();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setFormError(err.message);
      } else {
        setFormError('Failed to create faculty record.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;
    setFormError(null);
    setSubmitting(true);
    try {
      await teachersApi.update(editingTeacher.id, formData);
      setEditingTeacher(null);
      fetchData();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setFormError(err.message);
      } else {
        setFormError('Failed to update faculty record.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTeacher) return;
    setSubmitting(true);
    try {
      await teachersApi.delete(deletingTeacher.id);
      setDeletingTeacher(null);
      fetchData();
    } catch (err) {
      if (err instanceof ApiClientError) {
        alert(`Delete failed: ${err.message}`);
      } else {
        alert('Failed to delete teacher record.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const openCreateModal = () => {
    setFormData({
      employeeNumber: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      firstName: '',
      middleName: '',
      lastName: '',
      email: '',
      phone: '',
      specialization: '',
      departmentId: departments[0]?.id || '',
    });
    setFormError(null);
    setIsCreateOpen(true);
  };

  const openEditModal = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      employeeNumber: teacher.employeeNumber,
      firstName: teacher.firstName,
      middleName: teacher.middleName || '',
      lastName: teacher.lastName,
      email: teacher.email || '',
      phone: teacher.phone || '',
      specialization: teacher.specialization || '',
      departmentId: teacher.departmentId,
    });
    setFormError(null);
  };

  const filteredTeachers = teachers.filter(
    (t) =>
      t.firstName.toLowerCase().includes(search.toLowerCase()) ||
      t.lastName.toLowerCase().includes(search.toLowerCase()) ||
      t.employeeNumber.toLowerCase().includes(search.toLowerCase()) ||
      (t.email && t.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faculty & Teachers"
        description="Manage academic professors, lecturers, and departmental assignments"
        action={
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
          >
            <Icons.Plus className="w-4 h-4" />
            <span>Add Faculty Member</span>
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
              placeholder="Search faculty by name, employee ID, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <span className="text-xs text-slate-400">
            Total: <strong className="text-slate-200">{filteredTeachers.length}</strong> faculty members
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-6">Emp Code</th>
                <th className="py-3.5 px-6">Faculty Name</th>
                <th className="py-3.5 px-6">Department</th>
                <th className="py-3.5 px-6">Specialization</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 px-6"><div className="h-4 w-20 bg-slate-800 rounded" /></td>
                    <td className="py-4 px-6"><div className="h-4 w-36 bg-slate-800 rounded" /></td>
                    <td className="py-4 px-6"><div className="h-4 w-28 bg-slate-800 rounded" /></td>
                    <td className="py-4 px-6"><div className="h-4 w-32 bg-slate-800 rounded" /></td>
                    <td className="py-4 px-6"><div className="h-4 w-12 bg-slate-800 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <Icons.Teacher className="w-10 h-10 mx-auto text-slate-700 mb-2" />
                    <p className="font-medium">No faculty members found</p>
                    <p className="text-[11px]">Click "Add Faculty Member" to register a teacher.</p>
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6 font-mono font-semibold text-emerald-400">{teacher.employeeNumber}</td>
                    <td className="py-4 px-6">
                      <p className="font-medium text-slate-100">{teacher.firstName} {teacher.middleName || ''} {teacher.lastName}</p>
                      <p className="text-[11px] text-slate-400">{teacher.email || 'No email'}</p>
                    </td>
                    <td className="py-4 px-6 text-slate-300">{teacher.department?.name || 'Assigned Dept'}</td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-semibold text-[11px]">
                        {teacher.specialization || 'General Academic'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(teacher)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Edit Faculty Member"
                      >
                        <Icons.Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingTeacher(teacher)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Delete Faculty Member"
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
      {(isCreateOpen || editingTeacher) && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">
                {isCreateOpen ? 'Register Faculty Member' : 'Edit Teacher'}
              </h3>
              <button
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingTeacher(null);
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
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Employee Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="EMP-1004"
                    value={formData.employeeNumber}
                    onChange={(e) => setFormData({ ...formData, employeeNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
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
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Dr. Sarah"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Smith"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="sarah.smith@faculty.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Specialization / Domain</label>
                <input
                  type="text"
                  placeholder="Artificial Intelligence, Distributed Systems"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setEditingTeacher(null);
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
                  {submitting ? 'Saving...' : isCreateOpen ? 'Register Faculty' : 'Update Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deletingTeacher && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <Icons.Trash className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-white">Delete Teacher?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Are you sure you want to delete <strong className="text-slate-200">{deletingTeacher.firstName} {deletingTeacher.lastName}</strong>?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingTeacher(null)}
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
