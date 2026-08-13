import { Injectable,NotFoundException,ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { TenantContext } from '../../common/tenant/tenant-context.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
@Injectable()
export class DepartmentService {
    constructor(
        private readonly primsa:PrismaService,
        private readonly tenantContext:TenantContext
    ){}

    private getTenantId():string{
        return this.tenantContext.getTenantId();
    }

    async create(dto:CreateDepartmentDto){
        const tenantId = this.getTenantId();
        const campus = await this.primsa.campus.findFirst({
            where:{
                id:dto.campusId,
                tenantId
            }
        });

        if(!campus){
            throw new NotFoundException("Campus not found")
        }

        const existing = await this.primsa.department.findFirst({
            where:{
                tenantId,
                OR:[
                    {name:dto.name},
                    {code:dto.code}
                ],
            }
        });

        if(existing){
            throw new NotFoundException("Department name or code already exists")
        }

        return this.primsa.department.create({
            data:{
                tenantId,
                campusId:dto.campusId,
                name:dto.name,
                code:dto.code,
                description:dto.description
            }
        })

    }

    async findAll(){
        const tenantId = this.getTenantId();
        return this.primsa.department.findMany({
            where:{
                tenantId
            },
            include:{
                campus:true
            },
            orderBy:{
                name:'asc'
            }
        })
    }
    
    // findOne( by Id)
    async findOne(id:string){
        const tenantId = this.getTenantId();
        const department = await this.primsa.department.findFirst({
            where:{
                id,
                tenantId
            },
            include:{
                campus:true
            }
        });

        if(!department){
            throw new NotFoundException("Department not found")
        }
        return department;
    
    }

    async update(id:string,dto:UpdateDepartmentDto){
        const tenantId = this.getTenantId();
        const department = await this.primsa.department.findFirst({
            where:{
                id,
                tenantId
            }
        });

        if(!department){
            throw new NotFoundException("Department not found")
        }

        // check if new campus belongs to the same tenant
        if(dto.campusId&&
            dto.campusId!==department.campusId){
            const campus = await this.primsa.campus.findFirst({
                where:{
                    id:dto.campusId,
                    tenantId
                }
            });

            if(!campus){
                throw new NotFoundException("Campus not found")
            }
        }

        const duplicate = await this.primsa.department.findFirst({
            where:{
                tenantId,
                OR:[
                    ...(dto.name
                        ?[{name:dto.name}]
                        :[]),
                    ...(dto.code
                        ?[{code:dto.code}]
                        :[])
                ],
                NOT:{id}
            }
        });

        if(duplicate){
         throw new ConflictException("Department name or code already exists")
        }
        return this.primsa.department.update({
            where:{
                id
            },
            data:{
                ...(dto.campusId!==undefined&&{campusId:dto.campusId}),
                ...(dto.name!==undefined&&{name:dto.name}),
                ...(dto.code!==undefined&&{code:dto.code}),
                ...(dto.description!==undefined&&{description:dto.description})
            }
        })
                    
                

    }
    async remove(id:string){
        const tenantId = this.getTenantId();
        const department = await this.primsa.department.findFirst({
            where:{
                id,
                tenantId
            }
        });

        if(!department){
            throw new NotFoundException("Department not found")
        }
         this.primsa.department.delete({
            where:{
                id
            }
        })
        return {message:"Department deleted successfully"}
    }

}