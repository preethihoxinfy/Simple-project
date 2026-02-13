import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import * as express from 'express';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //  app.enableCors({
  //    origin: 'http://127.0.0.1:5500', // <-- frontend URL
  //    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  //    credentials: true,
  //  }); 
   app.use('/exports', express.static(join(__dirname, '../exports')));
  await app.listen(process.env.PORT ?? 3002);
}
bootstrap();
