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

@Module({
  controllers: [
    CampusController,
    DepartmentController,
    ProgramController,
    CourseController,
    StudentController,
  ],

  providers: [
    CampusService,
    DepartmentService,
    ProgramService,
    CourseService,
    StudentService, 
  ],

  exports: [
    CampusService,
    DepartmentService,
    ProgramService,
    CourseService,
    StudentService,
  ],
})
export class AcademicModule {}