import { ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';

import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { AppModule } from './app.module';
import { RolesGuard } from './auth/guards/roles.guard';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const reflector: Reflector = new Reflector();
    app.use(helmet());
    app.use(cookieParser());
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
        })
    );
    app.enableCors({
        origin: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });
    app.useGlobalGuards(new RolesGuard(reflector), new JwtAuthGuard(reflector));
    const config = new DocumentBuilder()
        .setTitle('Manager system')
        .setDescription('sistema de gestão')
        .setVersion('1.0')
        .addTag('MS')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
    await app.listen(process.env.PORT ? parseInt(process.env.PORT) : 3000);
}
bootstrap();
