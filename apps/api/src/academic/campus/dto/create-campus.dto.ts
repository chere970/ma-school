import { IsNotEmpty, IsOptional, IsString } from "class-validator"


export class CreateCampusDto{
    @IsString()
    @IsNotEmpty()
    name: string

    @IsString()
    @IsNotEmpty()
    code:string

    @IsOptional()
    @IsString()
    address?:string
}