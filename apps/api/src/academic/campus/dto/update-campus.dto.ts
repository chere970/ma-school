
import {IsOptional,IsString} from'class-validator'
export class UpdateCampusDto{
    @IsOptional()
    @IsString()
    name?:string;

    @IsOptional()
    @IsString()
    code?:string;

    @IsOptional()
    @IsString()
    address?:string;
}