import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantContextInterceptor } from '../../common/tenant/tenant-context.interceptor';

import { StudentResultService } from './student-result.service';
import { CreateStudentResultDto } from './dto/create-student-result.dto';
import { UpdateStudentResultDto } from './dto/update-student-result.dto';

@Controller('student-results')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantContextInterceptor)
@ApiTags('Student Results')
@ApiBearerAuth('access-token')
@Controller('student-results')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantContextInterceptor)
export class StudentResultController {
  constructor(
    private readonly studentResultService: StudentResultService,
  ) {}

  @Post()
@ApiOperation({
  summary: 'Create a student result',
  description:
    'Creates a result for a student in an assessment. Grade and grade point are calculated automatically.',
})
@ApiResponse({
  status: 201,
  description: 'Student result created successfully.',
})
@ApiResponse({
  status: 400,
  description: 'Invalid score or student is not enrolled in the course.',
})
@ApiResponse({
  status: 404,
  description: 'Assessment or student not found.',
})
@ApiResponse({
  status: 409,
  description: 'Result already exists for this assessment and student.',
})
create(@Body() dto: CreateStudentResultDto) {
  return this.studentResultService.create(dto);
}
 @Get()
@ApiOperation({
  summary: 'Get student results',
  description:
    'Returns student results for the authenticated tenant. Results can be filtered by assessment or student.',
})
@ApiQuery({
  name: 'assessmentId',
  required: false,
  type: String,
  format: 'uuid',
})
@ApiQuery({
  name: 'studentId',
  required: false,
  type: String,
  format: 'uuid',
})
@ApiResponse({
  status: 200,
  description: 'Student results retrieved successfully.',
})
findAll(
  @Query('assessmentId') assessmentId?: string,
  @Query('studentId') studentId?: string,
) {
  return this.studentResultService.findAll({
    assessmentId,
    studentId,
  });
}

  @Get(':id')
@ApiOperation({
  summary: 'Get a student result',
})
@ApiParam({
  name: 'id',
  description: 'Student result ID',
  format: 'uuid',
})
@ApiResponse({
  status: 200,
  description: 'Student result retrieved successfully.',
})
@ApiResponse({
  status: 404,
  description: 'Student result not found.',
})
findOne(@Param('id') id: string) {
  return this.studentResultService.findOne(id);
}

 @Patch(':id')
@ApiOperation({
  summary: 'Update a student result',
  description:
    'Updates the score or remark. When the score changes, grade and grade point are recalculated automatically.',
})
@ApiParam({
  name: 'id',
  description: 'Student result ID',
  format: 'uuid',
})
@ApiResponse({
  status: 200,
  description: 'Student result updated successfully.',
})
@ApiResponse({
  status: 400,
  description: 'Invalid update data.',
})
@ApiResponse({
  status: 404,
  description: 'Student result not found.',
})
update(
  @Param('id') id: string,
  @Body() dto: UpdateStudentResultDto,
) {
  return this.studentResultService.update(id, dto);
}

  @Delete(':id')
@ApiOperation({
  summary: 'Delete a student result',
})
@ApiParam({
  name: 'id',
  description: 'Student result ID',
  format: 'uuid',
})
@ApiResponse({
  status: 200,
  description: 'Student result deleted successfully.',
})
@ApiResponse({
  status: 404,
  description: 'Student result not found.',
})
remove(@Param('id') id: string) {
  return this.studentResultService.remove(id);
}
}
