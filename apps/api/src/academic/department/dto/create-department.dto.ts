import { IsNotEmpty,IsString,IsOptional } from "class-validator";


export class CreateDepartmentDto {
    @IsNotEmpty()
    @IsString()
    campusId:string;

    @IsNotEmpty()
    @IsString()
    name:string;

    @IsNotEmpty()
    @IsString()
    code:string;

    @IsString()
    @IsOptional()
    description?:string;
    

}