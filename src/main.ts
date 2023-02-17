import { Logger } from '@nestjs/common';
import { TransformInterceptor } from './transform.interceptor';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger();
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new TransformInterceptor())
  const port = 5000;
  await app.listen(port);
  logger.log(`Application litsening on port ${port}`)
}
bootstrap();
