import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const allowedOrigins = frontendUrl.includes(',')
    ? frontendUrl.split(',').map(url => url.trim())
    : [frontendUrl];

  // Add all Vercel preview URLs (they change with each deployment)
  const vercelPatterns = [
    'https://minorproject-',
    'https://*.vercel.app',
    'http://localhost:3000',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin) || allowedOrigins.some(url => origin?.startsWith(url))) {
        callback(null, true);
      }
      // Allow all Vercel preview URLs
      else if (vercelPatterns.some(pattern => {
        if (pattern.includes('*')) {
          const regex = new RegExp(pattern.replace('*', '.*'));
          return regex.test(origin);
        }
        return origin.startsWith(pattern);
      })) {
        callback(null, true);
      }
      // In development, allow all origins
      else if (process.env.NODE_ENV !== 'production') {
        callback(null, true);
      }
      // In production, allow all Vercel domains
      else if (origin.includes('vercel.app')) {
        callback(null, true);
      }
      else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Student Gateway API running on http://localhost:${port}`);
}

bootstrap();
