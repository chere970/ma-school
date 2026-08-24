'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Icons } from '@/components/ui/icons';
import { Timetable, TeachingAssignment, Room } from '@/types/academic';
import { timetableApi, CreateTimetableInput } from '@/lib/api/timetable';
import { teachingAssignmentsApi } from '@/lib/api/teaching-assignments';
import { roomsApi } from '@/lib/api/rooms';
import { ApiClientError } from '@/lib/api/client';

const DAYS = [
  { id: 1, name: 'Monday' },
  { id: 2, name: 'Tuesday' },
  { id: 3, name: 'Wednesday' },
  { id: 4, name: 'Thursday' },
  { id: 5, name: 'Friday' },
  { id: 6, name: 'Saturday' },
];

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
];

export default function TimetablePage() {
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [assignments, setAssignments] = useState<TeachingAssignment[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [selectedRoomFilter, setSelectedRoomFilter] = useState<string>('');

  // Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deletingSlot, setDeletingSlot] = useState<Timetable | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateTimetableInput>({
    teachingAssignmentId: '',
    roomId: '',
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '11:00',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ttData, asgnData, roomData] = await Promise.all([
        timetableApi.getAll(),
        teachingAssignmentsApi.getAll(),
        roomsApi.getAll(),
      ]);
      setTimetables(ttData);
      setAssignments(asgnData);
      setRooms(roomData);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('Failed to fetch timetable schedule matrix.');
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
      await timetableApi.create(formData);
      setIsCreateOpen(false);
      fetchData();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setFormError(err.message);
      } else {
        setFormError('Failed to schedule class slot.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingSlot) return;
    setSubmitting(true);
    try {
      await timetableApi.delete(deletingSlot.id);
      setDeletingSlot(null);
      fetchData();
    } catch (err) {
      if (err instanceof ApiClientError) {
        alert(`Delete failed: ${err.message}`);
      } else {
        alert('Failed to remove class slot.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const openCreateModal = (dayOfWeek = 1, startTime = '09:00') => {
    setFormData({
      teachingAssignmentId: assignments[0]?.id || '',
      roomId: rooms[0]?.id || '',
      dayOfWeek,
      startTime,
      endTime: '11:00',
    });
    setFormError(null);
    setIsCreateOpen(true);
  };

  const filteredTimetables = timetables.filter((t) => {
    if (!selectedRoomFilter) return true;
    return t.roomId === selectedRoomFilter;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Timetable & Class Schedule Matrix"
        description="Weekly visual timetable matrix mapping courses, faculty, rooms, and time slots"
        action={
          <button
            onClick={() => openCreateModal()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
          >
            <Icons.Plus className="w-4 h-4" />
            <span>Schedule Class</span>
          </button>
        }
      />

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
          <Icons.AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Icons.Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-300">Filter Room:</span>
          <select
            value={selectedRoomFilter}
            onChange={(e) => setSelectedRoomFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Facilities & Rooms</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.code})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-indigo-600 inline-block" />
            Scheduled Slot
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-slate-800 inline-block border border-slate-700" />
            Open Cell
          </span>
        </div>
      </div>

      {/* Weekly Matrix Grid */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-950 text-slate-300 border-b border-slate-800">
                <th className="py-3.5 px-4 w-28 text-center font-bold border-r border-slate-800 text-xs">
                  Day / Time
                </th>
                {TIME_SLOTS.map((time) => (
                  <th key={time} className="py-3.5 px-3 text-center font-semibold text-slate-400 border-r border-slate-800/60 text-[11px]">
                    {time}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                DAYS.map((day) => (
                  <tr key={day.id} className="animate-pulse">
                    <td className="py-6 px-4 bg-slate-950 font-semibold text-slate-300 border-r border-slate-800 text-center">
                      {day.name}
                    </td>
                    {TIME_SLOTS.map((t) => (
                      <td key={t} className="p-2 border-r border-slate-800/40">
                        <div className="h-12 bg-slate-800/50 rounded-lg" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                DAYS.map((day) => (
                  <tr key={day.id} className="hover:bg-slate-950/20 transition-colors">
                    <td className="py-4 px-4 bg-slate-950/80 font-bold text-slate-200 border-r border-slate-800 text-center">
                      {day.name}
                    </td>
                    {TIME_SLOTS.map((timeSlot) => {
                      // Find items for this day
                      const daySlots = filteredTimetables.filter(
                        (t) => t.dayOfWeek === day.id && t.startTime.startsWith(timeSlot.substring(0, 2))
                      );

                      return (
                        <td
                          key={timeSlot}
                          className="p-1.5 border-r border-slate-800/50 vertical-top h-24 min-w-[120px]"
                        >
                          {daySlots.length > 0 ? (
                            <div className="space-y-1.5 h-full">
                              {daySlots.map((slot) => (
                                <div
                                  key={slot.id}
                                  className="p-2 rounded-xl bg-indigo-950/80 border border-indigo-700/60 text-indigo-100 shadow-md relative group hover:border-indigo-500 transition-all"
                                >
                                  <button
                                    onClick={() => setDeletingSlot(slot)}
                                    className="absolute top-1 right-1 p-1 rounded-md text-indigo-300 hover:text-rose-400 hover:bg-rose-500/20 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                    title="Delete Schedule"
                                  >
                                    <Icons.Trash className="w-3.5 h-3.5" />
                                  </button>
                                  <p className="font-extrabold text-[11px] text-white truncate pr-4">
                                    {slot.teachingAssignment?.course?.code || 'Course'}
                                  </p>
                                  <p className="text-[10px] text-indigo-300 font-medium truncate">
                                    {slot.teachingAssignment?.teacher ? `${slot.teachingAssignment.teacher.firstName} ${slot.teachingAssignment.teacher.lastName}` : 'Teacher'}
                                  </p>
                                  <div className="mt-1 flex items-center justify-between text-[9px] text-indigo-400 font-mono">
                                    <span>{slot.room?.code || 'Room'}</span>
                                    <span>{slot.startTime}-{slot.endTime}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <button
                              onClick={() => openCreateModal(day.id, timeSlot)}
                              className="w-full h-full min-h-[50px] rounded-xl border border-dashed border-slate-800/80 hover:border-indigo-500/50 hover:bg-indigo-600/5 transition-all flex items-center justify-center text-slate-600 hover:text-indigo-400 group cursor-pointer"
                              title={`Schedule on ${day.name} at ${timeSlot}`}
                            >
                              <Icons.Plus className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                          )}
                        </td>
                      );
                    })}
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
              <h3 className="text-lg font-bold text-white">Schedule Class Slot</h3>
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
                <label className="block text-xs font-semibold text-slate-300 mb-1">Teaching Assignment (Course + Teacher) *</label>
                <select
                  required
                  value={formData.teachingAssignmentId}
                  onChange={(e) => setFormData({ ...formData, teachingAssignmentId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="" disabled>Select teaching assignment...</option>
                  {assignments.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.course?.code} ({a.course?.name}) — {a.teacher?.firstName} {a.teacher?.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Room Facility *</label>
                <select
                  required
                  value={formData.roomId}
                  onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="" disabled>Select room...</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.code} - {r.capacity} Seats)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Day of Week *</label>
                <select
                  value={formData.dayOfWeek}
                  onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) || 1 })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {DAYS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Start Time (HH:mm) *</label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">End Time (HH:mm) *</label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
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
                  {submitting ? 'Scheduling...' : 'Save Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deletingSlot && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <Icons.Trash className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-white">Remove Schedule Slot?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Are you sure you want to remove <strong className="text-slate-200">{deletingSlot.teachingAssignment?.course?.code}</strong> schedule on day {deletingSlot.dayOfWeek}?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingSlot(null)}
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
