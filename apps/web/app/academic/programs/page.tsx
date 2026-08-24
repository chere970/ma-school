'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Icons } from '@/components/ui/icons';
import { Program, Department } from '@/types/academic';
import { programsApi, CreateProgramInput } from '@/lib/api/programs';
import { departmentsApi } from '@/lib/api/departments';
import { ApiClientError } from '@/lib/api/client';

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [deletingProgram, setDeletingProgram] = useState<Program | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateProgramInput>({
    departmentId: '',
    name: '',
    code: '',
    degree: 'B.Sc.',
    durationYears: 4,
    description: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [progData, deptData] = await Promise.all([
        programsApi.getAll(),
        departmentsApi.getAll(),
      ]);
      setPrograms(progData);
      setDepartments(deptData);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('Failed to fetch degree programs.');
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
      await programsApi.create(formData);
      setIsCreateOpen(false);
      setFormData({ departmentId: '', name: '', code: '', degree: 'B.Sc.', durationYears: 4, description: '' });
      fetchData();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setFormError(err.message);
      } else {
        setFormError('Failed to create degree program.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProgram) return;
    setFormError(null);
    setSubmitting(true);
    try {
      await programsApi.update(editingProgram.id, formData);
      setEditingProgram(null);
      setFormData({ departmentId: '', name: '', code: '', degree: 'B.Sc.', durationYears: 4, description: '' });
      fetchData();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setFormError(err.message);
      } else {
        setFormError('Failed to update degree program.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingProgram) return;
    setSubmitting(true);
    try {
      await programsApi.delete(deletingProgram.id);
      setDeletingProgram(null);
      fetchData();
    } catch (err) {
      if (err instanceof ApiClientError) {
        alert(`Delete failed: ${err.message}`);
      } else {
        alert('Failed to delete program.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const openCreateModal = () => {
    setFormData({
      departmentId: departments[0]?.id || '',
      name: '',
      code: '',
      degree: 'B.Sc.',
      durationYears: 4,
      description: '',
    });
    setFormError(null);
    setIsCreateOpen(true);
  };

  const openEditModal = (program: Program) => {
    setEditingProgram(program);
    setFormData({
      departmentId: program.departmentId,
      name: program.name,
      code: program.code,
      degree: program.degree || 'B.Sc.',
      durationYears: program.durationYears || 4,
      description: program.description || '',
    });
    setFormError(null);
  };

  const filteredPrograms = programs.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      (p.department?.name && p.department.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Degree Programs"
        description="Manage undergraduate and postgraduate degree program offerings"
        action={
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
          >
            <Icons.Plus className="w-4 h-4" />
            <span>Add Program</span>
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
              placeholder="Search program or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <span className="text-xs text-slate-400">
            Total: <strong className="text-slate-200">{filteredPrograms.length}</strong> programs
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-6">Code</th>
                <th className="py-3.5 px-6">Program Name</th>
                <th className="py-3.5 px-6">Department</th>
                <th className="py-3.5 px-6">Degree</th>
                <th className="py-3.5 px-6">Duration</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 px-6"><div className="h-4 w-12 bg-slate-800 rounded" /></td>
                    <td className="py-4 px-6"><div className="h-4 w-36 bg-slate-800 rounded" /></td>
                    <td className="py-4 px-6"><div className="h-4 w-28 bg-slate-800 rounded" /></td>
                    <td className="py-4 px-6"><div className="h-4 w-16 bg-slate-800 rounded" /></td>
                    <td className="py-4 px-6"><div className="h-4 w-12 bg-slate-800 rounded" /></td>
                    <td className="py-4 px-6"><div className="h-4 w-12 bg-slate-800 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : filteredPrograms.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <Icons.Program className="w-10 h-10 mx-auto text-slate-700 mb-2" />
                    <p className="font-medium">No degree programs found</p>
                    <p className="text-[11px]">Click "Add Program" to create a curriculum.</p>
                  </td>
                </tr>
              ) : (
                filteredPrograms.map((prog) => (
                  <tr key={prog.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6 font-mono font-semibold text-amber-400">{prog.code}</td>
                    <td className="py-4 px-6 font-medium text-slate-100">{prog.name}</td>
                    <td className="py-4 px-6 text-slate-300">{prog.department?.name || 'Assigned Dept'}</td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-semibold text-[11px]">
                        {prog.degree || 'B.Sc.'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-400">{prog.durationYears ? `${prog.durationYears} Years` : '—'}</td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(prog)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Edit Program"
                      >
                        <Icons.Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingProgram(prog)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Delete Program"
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
      {(isCreateOpen || editingProgram) && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">
                {isCreateOpen ? 'Create Degree Program' : 'Edit Program'}
              </h3>
              <button
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingProgram(null);
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
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Program Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="BSCS, BBA, MSIT..."
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Degree Title</label>
                  <input
                    type="text"
                    placeholder="B.Sc., M.Sc., Ph.D."
                    value={formData.degree}
                    onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Program Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Bachelor of Science in Computer Science"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Duration (Years)</label>
                <input
                  type="number"
                  min={1}
                  max={6}
                  value={formData.durationYears}
                  onChange={(e) => setFormData({ ...formData, durationYears: parseInt(e.target.value) || 4 })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setEditingProgram(null);
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
                  {submitting ? 'Saving...' : isCreateOpen ? 'Create Program' : 'Update Program'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProgram && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <Icons.Trash className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-white">Delete Program?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Are you sure you want to delete <strong className="text-slate-200">{deletingProgram.name}</strong>?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingProgram(null)}
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
