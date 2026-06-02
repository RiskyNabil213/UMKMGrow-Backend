import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import * as bcrypt from 'bcrypt';

async function seedAdmin(prisma: PrismaService) {
  const email = 'admin123@gmail.com';
  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    const hashed = await bcrypt.hash('adminumkgrow123', 10);
    await prisma.user.create({
      data: {
        name:  'Admin UMKM Grow',
        email,
        password: hashed,
        role: 'admin',
        plan: 'free',
      },
    });
    console.log('✅ Admin account seeded: admin123@gmail.com');
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Seed admin account
  const prisma = app.get(PrismaService);
  await seedAdmin(prisma);

  // Setup Swagger jika package tersedia
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { SwaggerModule, DocumentBuilder } = require('@nestjs/swagger');
    const config = new DocumentBuilder()
      .setTitle('UMKM Grow API')
      .setDescription('Dokumentasi API UMKM Grow')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
    console.log('📚 Swagger available at /api');
  } catch {
    // Swagger tidak tersedia, skip
  }

  const port = Number(process.env.PORT || 8080);
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Server running on port ${port}`);
}

bootstrap().catch((err) => {
  console.error('BOOTSTRAP ERROR');
  console.error(err);
});
