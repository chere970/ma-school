'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Icons } from '@/components/ui/icons';
import { Student, Program } from '@/types/academic';
import { studentsApi, CreateStudentInput } from '@/lib/api/students';
import { programsApi } from '@/lib/api/programs';
import { ApiClientError } from '@/lib/api/client';

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

  // Form
  const [formData, setFormData] = useState<CreateStudentInput>({
    studentNumber: '',
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phone: '',
    admissionYear: 2024,
    yearLevel: 1,
    programId: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [studentData, progData] = await Promise.all([
        studentsApi.getAll(),
        programsApi.getAll(),
      ]);
      setStudents(studentData);
      setPrograms(progData);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('Failed to fetch student directory.');
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
      await studentsApi.create(formData);
      setIsCreateOpen(false);
      fetchData();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setFormError(err.message);
      } else {
        setFormError('Failed to create student record.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    setFormError(null);
    setSubmitting(true);
    try {
      await studentsApi.update(editingStudent.id, formData);
      setEditingStudent(null);
      fetchData();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setFormError(err.message);
      } else {
        setFormError('Failed to update student record.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingStudent) return;
    setSubmitting(true);
    try {
      await studentsApi.delete(deletingStudent.id);
      setDeletingStudent(null);
      fetchData();
    } catch (err) {
      if (err instanceof ApiClientError) {
        alert(`Delete failed: ${err.message}`);
      } else {
        alert('Failed to delete student.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const openCreateModal = () => {
    setFormData({
      studentNumber: `STD-${Math.floor(10000 + Math.random() * 90000)}`,
      firstName: '',
      middleName: '',
      lastName: '',
      email: '',
      phone: '',
      admissionYear: 2024,
      yearLevel: 1,
      programId: programs[0]?.id || '',
    });
    setFormError(null);
    setIsCreateOpen(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      studentNumber: student.studentNumber,
      firstName: student.firstName,
      middleName: student.middleName || '',
      lastName: student.lastName,
      email: student.email || '',
      phone: student.phone || '',
      admissionYear: student.admissionYear,
      yearLevel: student.yearLevel,
      programId: student.programId,
    });
    setFormError(null);
  };

  const filteredStudents = students.filter(
    (s) =>
      s.firstName.toLowerCase().includes(search.toLowerCase()) ||
      s.lastName.toLowerCase().includes(search.toLowerCase()) ||
      s.studentNumber.toLowerCase().includes(search.toLowerCase()) ||
      (s.email && s.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Directory"
        description="Manage enrolled university students, degree programs, and academic years"
        action={
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
          >
            <Icons.Plus className="w-4 h-4" />
            <span>Add Student</span>
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
              placeholder="Search by student name, ID, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <span className="text-xs text-slate-400">
            Total: <strong className="text-slate-200">{filteredStudents.length}</strong> students
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-6">ID Number</th>
                <th className="py-3.5 px-6">Student Name</th>
                <th className="py-3.5 px-6">Program</th>
                <th className="py-3.5 px-6">Year Level</th>
                <th className="py-3.5 px-6">Admission</th>
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
                    <td className="py-4 px-6"><div className="h-4 w-12 bg-slate-800 rounded" /></td>
                    <td className="py-4 px-6"><div className="h-4 w-12 bg-slate-800 rounded" /></td>
                    <td className="py-4 px-6"><div className="h-4 w-12 bg-slate-800 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <Icons.Student className="w-10 h-10 mx-auto text-slate-700 mb-2" />
                    <p className="font-medium">No students found</p>
                    <p className="text-[11px]">Click "Add Student" to register a new student.</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6 font-mono font-semibold text-blue-400">{student.studentNumber}</td>
                    <td className="py-4 px-6">
                      <p className="font-medium text-slate-100">{student.firstName} {student.middleName || ''} {student.lastName}</p>
                      <p className="text-[11px] text-slate-400">{student.email || 'No email'}</p>
                    </td>
                    <td className="py-4 px-6 text-slate-300">{student.program?.name || 'Assigned Program'}</td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 font-semibold text-[11px]">
                        Year {student.yearLevel}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-400">{student.admissionYear}</td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(student)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Edit Student"
                      >
                        <Icons.Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingStudent(student)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Delete Student"
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
      {(isCreateOpen || editingStudent) && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">
                {isCreateOpen ? 'Register New Student' : 'Edit Student'}
              </h3>
              <button
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingStudent(null);
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
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Student ID Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="STD-10023"
                    value={formData.studentNumber}
                    onChange={(e) => setFormData({ ...formData, studentNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Degree Program *</label>
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
                  <label className="block text-xs font-semibold text-slate-300 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="John"
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
                    placeholder="Doe"
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
                  placeholder="john.doe@student.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Year Level</label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={formData.yearLevel}
                    onChange={(e) => setFormData({ ...formData, yearLevel: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Admission Year</label>
                  <input
                    type="number"
                    min={2000}
                    max={2030}
                    value={formData.admissionYear}
                    onChange={(e) => setFormData({ ...formData, admissionYear: parseInt(e.target.value) || 2024 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setEditingStudent(null);
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
                  {submitting ? 'Saving...' : isCreateOpen ? 'Register Student' : 'Update Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deletingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <Icons.Trash className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-white">Delete Student?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Are you sure you want to delete <strong className="text-slate-200">{deletingStudent.firstName} {deletingStudent.lastName}</strong>?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingStudent(null)}
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
