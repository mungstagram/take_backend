import { HttpExceptionFilter } from './common/filter/http-exception-filter';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import passport from 'passport';

async function bootstrap() {
  // * Dev, Product Mode 설정
  const isDev = process.env.NODE_ENV === 'dev' ? true : false;

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());

  // * CORS
  app.enableCors({
    origin: true,
    credentials: true,
    exposedHeaders: ['Authorization'], // * 사용할 헤더 추가.
  });

  // * Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Pupfluencer API Document')
    .setDescription('Pupfluencer API 명세서')
    .setVersion('1.0.0')
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, swaggerDocument);

  app.use(passport.initialize());

  await app.listen(3000);
}
bootstrap();
