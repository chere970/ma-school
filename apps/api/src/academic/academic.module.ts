import { Module } from '@nestjs/common';
import{ CampusController} from './campus/campus.controller'
import {CampusService} from './campus/campus.service'
@Module({
    controllers:[CampusController],
    providers:[CampusService],
    exports:[CampusService],
})
export class AcademicModule{}