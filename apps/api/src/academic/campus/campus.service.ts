import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../common/prisma/prisma.service';
import { TenantContext } from '../../common/tenant/tenant-context.service';

import { CreateCampusDto } from './dto/create-campus.dto';
import {UpdateCampusDto} from './dto/update-campus.dto'
@Injectable()
export class CampusService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContext,
  ) {}

  private getTenantId(): string{
    return this.tenantContext.getTenantId();
  }
  async create(
    dto: CreateCampusDto,
  ) {
    const tenantId =
      this.getTenantId();

    const existing =
      await this.prisma.campus.findFirst({
        where: {
          tenantId,
          OR: [
            {
              name: dto.name,
            },
            {
              code: dto.code,
            },
          ],
        },
      });

    if (existing) {
      throw new ConflictException(
        'Campus name or code already exists',
      );
    }

    return this.prisma.campus.create({
      data: {
        tenantId,

        name: dto.name,
        code: dto.code,
        address: dto.address,
      },
    });
  }

  async findAll() {
    const tenantId =
      this.getTenantId();

    return this.prisma.campus.findMany({
      where: {
        tenantId,
      },

      orderBy: {
        name: 'asc',
      },
    });
  }
  async findOne(id:string){
    const tenantId= await this.getTenantId();
  const campus=  await this.prisma.campus.findFirst(
    {
      where: {
        id,
        tenantId
      }
    }
    );
    if(!campus){
      throw new NotFoundException('campus not found')
    }
    return campus;
  }
  async update(
    id:string,
    dto:UpdateCampusDto
  ){
    const tenantId= await this.getTenantId()
    const campus= await this.prisma.campus.findFirst({
      where:{
        id,
        tenantId,
      },
    });
    if(!campus)
    {
      throw new NotFoundException('Campus not found')
    }
    const duplicate= await this.prisma.campus.findFirst({
      where:{
        tenantId,
        OR:[
          {name:dto.name},
          {code:dto.code}
        ],
        NOT:{
          id,
        }
      }
    });
    if(duplicate){
      throw new ConflictException('Campus name or code already exist',);
    }
    return await this.prisma.campus.update({
      where:{
        id,
      },
      data:{
        name:dto.name,
        code:dto.code,
        address:dto.address
      }
    })

  }

  async remove(
    id:string
  ){
    const tenantId= await this.getTenantId();
    const campus=await this.prisma.campus.findFirst({
      where:{
        id,
        tenantId
      }

    })
    if(!campus){
      throw new NotFoundException('Campus not found')
    }
    await this.prisma.campus.delete({
      where:{
        id,
      }
    });
    return "Campus deleted successfully!";
  }
}