import { NestFactory } from '@nestjs/core';
import { Sequelize } from 'sequelize-typescript';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    app.enableCors({
      origin: process.env.REACT_APP_ORIGIN ?? 'http://localhost:5173',
      methods: ['GET', 'POST', 'DELETE'],
      allowedHeaders: ['Content-Type'],
    });

    const sequelize = app.get(Sequelize);
    await sequelize.authenticate();

    console.log('✅ PostgreSQL connected successfully');

    await app.listen(process.env.PORT ?? 3000);

    console.log(
      `✅ NestJS API running on http://localhost:${process.env.PORT ?? 3000}`,
    );
  } catch (error) {
    console.error('❌ Failed to start NestJS app');
    console.error(error);
    process.exit(1);
  }
}

void bootstrap();
