import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as process from 'process';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    snapshot: true,
  });
  const config = new DocumentBuilder()
    .setTitle('Nest Project')
    .setVersion('1.0.1')
    .setDescription('A First Look At Nest Js FrameWork and it awesome')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  const port = parseInt(process.env.PORT) || 3000;
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  await app.listen(port);

  console.log(`
    🚀  Server is running! at http://localhost:${port}
  `);
}
bootstrap();
