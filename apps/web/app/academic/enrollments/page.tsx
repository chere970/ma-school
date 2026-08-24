'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Icons } from '@/components/ui/icons';
import { Enrollment, Student, Course, EnrollmentStatus } from '@/types/academic';
import { enrollmentsApi, CreateEnrollmentInput } from '@/lib/api/enrollments';
import { studentsApi } from '@/lib/api/students';
import { coursesApi } from '@/lib/api/courses';
import { ApiClientError } from '@/lib/api/client';

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deletingEnrollment, setDeletingEnrollment] = useState<Enrollment | null>(null);

  // Form
  const [formData, setFormData] = useState<CreateEnrollmentInput>({
    studentId: '',
    courseId: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [enrollmentData, studentData, courseData] = await Promise.all([
        enrollmentsApi.getAll(),
        studentsApi.getAll(),
        coursesApi.getAll(),
      ]);
      setEnrollments(enrollmentData);
      setStudents(studentData);
      setCourses(courseData);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('Failed to fetch course enrollments.');
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
      await enrollmentsApi.create(formData);
      setIsCreateOpen(false);
      fetchData();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setFormError(err.message);
      } else {
        setFormError('Failed to enroll student in course.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: EnrollmentStatus) => {
    try {
      await enrollmentsApi.update(id, { status: newStatus });
      fetchData();
    } catch (err) {
      if (err instanceof ApiClientError) {
        alert(err.message);
      }
    }
  };

  const handleDelete = async () => {
    if (!deletingEnrollment) return;
    setSubmitting(true);
    try {
      await enrollmentsApi.delete(deletingEnrollment.id);
      setDeletingEnrollment(null);
      fetchData();
    } catch (err) {
      if (err instanceof ApiClientError) {
        alert(`Delete failed: ${err.message}`);
      } else {
        alert('Failed to delete enrollment record.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const openCreateModal = () => {
    setFormData({
      studentId: students[0]?.id || '',
      courseId: courses[0]?.id || '',
    });
    setFormError(null);
    setIsCreateOpen(true);
  };

  const filteredEnrollments = enrollments.filter(
    (e) =>
      (e.student && (e.student.firstName + ' ' + e.student.lastName).toLowerCase().includes(search.toLowerCase())) ||
      (e.student && e.student.studentNumber.toLowerCase().includes(search.toLowerCase())) ||
      (e.course && e.course.name.toLowerCase().includes(search.toLowerCase())) ||
      (e.course && e.course.code.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Enrollments"
        description="Register and manage student registrations for active academic courses"
        action={
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
          >
            <Icons.Plus className="w-4 h-4" />
            <span>Enroll Student</span>
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
              placeholder="Search by student, ID, or course..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <span className="text-xs text-slate-400">
            Total: <strong className="text-slate-200">{filteredEnrollments.length}</strong> enrollments
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-6">Student</th>
                <th className="py-3.5 px-6">Enrolled Course</th>
                <th className="py-3.5 px-6">Enrollment Date</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 px-6"><div className="h-4 w-36 bg-slate-800 rounded" /></td>
                    <td className="py-4 px-6"><div className="h-4 w-40 bg-slate-800 rounded" /></td>
                    <td className="py-4 px-6"><div className="h-4 w-24 bg-slate-800 rounded" /></td>
                    <td className="py-4 px-6"><div className="h-4 w-16 bg-slate-800 rounded" /></td>
                    <td className="py-4 px-6"><div className="h-4 w-12 bg-slate-800 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : filteredEnrollments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <Icons.Enrollment className="w-10 h-10 mx-auto text-slate-700 mb-2" />
                    <p className="font-medium">No enrollments registered</p>
                    <p className="text-[11px]">Click "Enroll Student" to enroll a student into a course.</p>
                  </td>
                </tr>
              ) : (
                filteredEnrollments.map((enr) => (
                  <tr key={enr.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-medium text-slate-100">{enr.student ? `${enr.student.firstName} ${enr.student.lastName}` : 'Student Record'}</p>
                      <p className="text-[11px] font-mono text-slate-400">{enr.student?.studentNumber}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-medium text-slate-200">{enr.course?.name || 'Course Title'}</p>
                      <p className="text-[11px] font-mono text-purple-400">{enr.course?.code}</p>
                    </td>
                    <td className="py-4 px-6 text-slate-400">
                      {new Date(enr.enrollmentDate).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <select
                        value={enr.status}
                        onChange={(e) => handleStatusChange(enr.id, e.target.value as EnrollmentStatus)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="DROPPED">DROPPED</option>
                        <option value="WITHDRAWN">WITHDRAWN</option>
                      </select>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => setDeletingEnrollment(enr)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Remove Enrollment"
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

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">Enroll Student in Course</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-white">
                <Icons.X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <Icons.AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Student *</label>
                <select
                  required
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="" disabled>Choose student...</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} ({s.studentNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Course *</label>
                <select
                  required
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="" disabled>Choose course...</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} — {c.name} ({c.creditHours} Credits)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 disabled:opacity-50"
                >
                  {submitting ? 'Enrolling...' : 'Confirm Enrollment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deletingEnrollment && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <Icons.Trash className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-white">Remove Enrollment?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Are you sure you want to remove enrollment for <strong className="text-slate-200">{deletingEnrollment.student?.firstName} {deletingEnrollment.student?.lastName}</strong> in <strong className="text-slate-200">{deletingEnrollment.course?.code}</strong>?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingEnrollment(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={submitting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-lg shadow-rose-600/25 disabled:opacity-50"
              >
                {submitting ? 'Removing...' : 'Remove Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
