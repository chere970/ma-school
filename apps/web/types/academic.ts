export interface Campus {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  address?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  tenantId: string;
  campusId: string;
  campus?: Campus;
  name: string;
  code: string;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Program {
  id: string;
  tenantId: string;
  departmentId: string;
  department?: Department;
  name: string;
  code: string;
  degree?: string | null;
  durationYears?: number | null;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  tenantId: string;
  departmentId: string;
  department?: Department;
  programId?: string | null;
  program?: Program | null;
  code: string;
  name: string;
  description?: string | null;
  creditHours: number;
  semester?: number | null;
  yearLevel?: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  tenantId: string;
  studentNumber: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  admissionYear: number;
  yearLevel: number;
  programId: string;
  program?: Program;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Teacher {
  id: string;
  tenantId: string;
  employeeNumber: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  specialization?: string | null;
  hireDate?: string | null;
  departmentId: string;
  department?: Department;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type EnrollmentStatus = 'ACTIVE' | 'COMPLETED' | 'DROPPED' | 'WITHDRAWN';

export interface Enrollment {
  id: string;
  tenantId: string;
  studentId: string;
  student?: Student;
  courseId: string;
  course?: Course;
  enrollmentDate: string;
  status: EnrollmentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TeachingAssignment {
  id: string;
  tenantId: string;
  teacherId: string;
  teacher?: Teacher;
  courseId: string;
  course?: Course;
  assignedAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  id: string;
  tenantId: string;
  campusId: string;
  campus?: Campus;
  name: string;
  code: string;
  capacity: number;
  type?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Timetable {
  id: string;
  tenantId: string;
  teachingAssignmentId: string;
  teachingAssignment?: TeachingAssignment;
  roomId: string;
  room?: Room;
  dayOfWeek: number; // 1 = Mon, 7 = Sun
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
