import { Module } from '@nestjs/common';
import{ CampusController} from './campus/campus.controller'
import {CampusService} from './campus/campus.service'
import { DepartmentService } from './department/department.service';
import { DepartmentController } from './department/department.controller';
import { ProgramController } from './program/program.controller';
import { ProgramService } from './program/program.service';
@Module({
    controllers:[CampusController,DepartmentController,ProgramController],
    providers:[CampusService,DepartmentService,ProgramService],
    exports:[CampusService,DepartmentService,ProgramService],
})
export class AcademicModule{}