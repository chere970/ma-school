import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('CampusCore ERP API')
    .setDescription(
      'Multi-tenant School and University ERP REST API',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT access token',
        in: 'header',
      },
      'access-token',
    )
    .addGlobalParameters({
      name: 'x-tenant-id',
      in: 'header',
      description:
        'Tenant slug/ID. Required for public tenant-scoped endpoints; optional for authenticated endpoints (tenant is derived from JWT).',
      required: false,
      schema: { type: 'string' },
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document);
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
