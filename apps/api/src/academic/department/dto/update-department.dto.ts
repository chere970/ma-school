import { IsOptional, IsString } from "class-validator";

export class UpdateDepartmentDto {

    @IsString()
    @IsOptional()
    campusId?:string;

    @IsString()
    @IsOptional()
    name?:string;

    @IsString()
    @IsOptional()
    code?:string;

    @IsString()
    @IsOptional()
    description?:string;

}