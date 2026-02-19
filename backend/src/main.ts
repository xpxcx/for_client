import 'dotenv/config';
import { mkdirSync, existsSync } from 'fs';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cookieParser = require('cookie-parser');
import { join } from 'path';
import { AppModule } from './app.module';

const uploadsDirs = [
  join(process.cwd(), 'uploads', 'achievements'),
  join(process.cwd(), 'uploads', 'profile'),
  join(process.cwd(), 'uploads', 'materials'),
];
uploadsDirs.forEach((dir) => {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
});

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(cookieParser());
  const helmet = await import('helmet');
  app.use(helmet.default({ contentSecurityPolicy: false }));
  const corsOrigins = ['http://localhost:5173', 'http://localhost:3000'];
  if (process.env.FRONTEND_ORIGIN) {
    corsOrigins.push(process.env.FRONTEND_ORIGIN);
  }
  app.enableCors({
    origin: corsOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  app.setGlobalPrefix('api');
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
