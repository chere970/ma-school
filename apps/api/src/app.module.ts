import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './common/prisma/prisma.module';
import { TenantContextModule } from './common/tenant/tenant-context.module';
import { TenantMiddleware } from './tenants/middleware/tenant.middleware';
import { envValidationSchema } from './config/env.validation';
import { ConfigModule } from '@nestjs/config/dist/config.module';
import configuration  from './config/configuration';
import { AppConfigModule } from './config/config.module';
@Module({
  // imports: [PrismaModule,
  //   TenantContextModule,
  //   ConfigModule.forRoot({
  //     isGlobal: true,
  //     load: [configuration],
  //     validationSchema:envValidationSchema,
  //   })
  // ],
  imports:[AppConfigModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
      
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
