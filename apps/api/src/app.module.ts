import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './common/prisma/prisma.module';
import { TenantContextModule } from './common/tenant/tenant-context.module';
import { TenantContextInterceptor } from './common/tenant/tenant-context.interceptor';
import { TenantMiddleware } from './tenants/middleware/tenant.middleware';
import { AppConfigModule } from './config/config.module';
import { TenantModule } from './tenants/tenant.module';
import { AuthModule } from './auth/auth.module';
import { AcademicModule } from './academic/academic.module';

@Module({
  imports: [
    AppConfigModule,
    TenantContextModule,
    PrismaModule,
    TenantModule,
    AuthModule,
    AcademicModule,
  ],
  controllers: [AppController],
  providers: [AppService, TenantContextInterceptor],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
