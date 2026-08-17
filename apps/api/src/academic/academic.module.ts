import { Module } from '@nestjs/common';

import { CampusController } from './campus/campus.controller';
import { CampusService } from './campus/campus.service';

import { DepartmentController } from './department/department.controller';
import { DepartmentService } from './department/department.service';

import { ProgramController } from './program/program.controller';
import { ProgramService } from './program/program.service';

import { CourseController } from './course/course.controller';
import { CourseService } from './course/course.service';
import { StudentController } from './student/student.controller';
import { StudentService } from './student/student.service';
import { TeacherController } from './teacher/teacher.controller';
import { TeacherService } from './teacher/teacher.service';
import { EnrollmentController } from './enrollment/enrollment.controller';
import { EnrollmentService } from './enrollment/enrollment.service';

@Module({
  controllers: [
    CampusController,
    DepartmentController,
    ProgramController,
    CourseController,
    StudentController,
    TeacherController,
    EnrollmentController,
  ],

  providers: [
    CampusService,
    DepartmentService,
    ProgramService,
    CourseService,
    StudentService, 
    TeacherService,
    EnrollmentService,
  ],

  exports: [
    CampusService,
    DepartmentService,
    ProgramService,
    CourseService,
    StudentService,
    TeacherService,
    EnrollmentService,
  ],
})
export class AcademicModule {}