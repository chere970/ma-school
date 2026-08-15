import { Module } from '@nestjs/common';

import { CampusController } from './academic/campus/campus.controller';
import { CampusService } from './academic/campus/campus.service';

import { DepartmentController } from './academic/department/department.controller';
import { DepartmentService } from './academic/department/department.service';

import { ProgramController } from './academic/program/program.controller';
import { ProgramService } from './academic/program/program.service';

import { CourseController } from './academic/course/course.controller';
import { CourseService } from './academic/course/course.service';

@Module({
  controllers: [
    CampusController,
    DepartmentController,
    ProgramController,
    CourseController,
  ],

  providers: [
    CampusService,
    DepartmentService,
    ProgramService,
    CourseService,
  ],

  exports: [
    CampusService,
    DepartmentService,
    ProgramService,
    CourseService,
  ],
})
export class AcademicModule {}