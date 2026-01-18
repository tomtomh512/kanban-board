import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.enableCors({
        origin: 'http://localhost:5173',
        credentials: true,
    });

    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe());

    await app.listen(3001);
    console.log('Backend running on http://localhost:3001');
}
bootstrap();