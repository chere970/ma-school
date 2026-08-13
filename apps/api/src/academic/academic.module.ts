import { Module } from '@nestjs/common';
import{ CampusController} from './campus/campus.controller'
import {CampusService} from './campus/campus.service'
import { DepartmentService } from './department/department.service';
import { DepartmentController } from './department/department.controller';
@Module({
    controllers:[CampusController,DepartmentController],
    providers:[CampusService,DepartmentService],
    exports:[CampusService,DepartmentService],
})
export class AcademicModule{}