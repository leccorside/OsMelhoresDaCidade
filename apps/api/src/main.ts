import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as path from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    helmet({
      crossOriginResourcePolicy: false,
    }),
  );
  const cookieMiddleware = (cookieParser as any).default || cookieParser;
  app.use(cookieMiddleware());

  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });

  const uploadsPath = path.join(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadsPath));
  app.use('/api/v1/uploads', express.static(uploadsPath));

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Os Melhores da Cidade API')
    .setDescription('API REST oficial da plataforma Os Melhores da Cidade')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3333;
  await app.listen(port);
  console.log(`🚀 API Os Melhores da Cidade rodando em http://localhost:${port}/api/v1`);
  console.log(`📚 Swagger disponível em http://localhost:${port}/docs`);
}
bootstrap();

