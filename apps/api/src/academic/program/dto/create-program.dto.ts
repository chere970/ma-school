import{IsNotEmpty,IsOptional,IsString,IsNumber,Min} from 'class-validator';

export class CreateProgramDto {
@IsNotEmpty()
@IsString()
 departmentId:string;

 @IsNotEmpty()
 @IsString()
 name:string;

 @IsNotEmpty()
 @IsString()
 code:string;

 @IsOptional()
 @IsString()
 degree?:string;

 @IsOptional()
 @IsNumber()
 @Min(1)
 durationYears?:number;

 @IsOptional()
 @IsString()
 description?:string;

}