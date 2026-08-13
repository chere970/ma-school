import { Module } from '@nestjs/common';
import{ CampusController} from './campus/campus.controller'
import {CampusService} from './campus/campus.service'
import { DepartmentService } from './department/department.service';
import { DepartmentController } from './department/department.controller';
import { ProgramController } from './program/program.controller';
import { ProgramService } from './program/program.service';
import { CourseService } from './course/course.service';
import { CourseController } from './course/course.controller';
@Module({
    controllers:[CampusController,DepartmentController,ProgramController,CourseController],
    providers:[CampusService,DepartmentService,ProgramService,CourseService],
    exports:[CampusService,DepartmentService,ProgramService,CourseService],
})
export class AcademicModule{}