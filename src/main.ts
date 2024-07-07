import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as express from 'express';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Request, Response, NextFunction } from 'express';
import { IncomingMessage, ServerResponse } from 'http';
import * as basicAuth from 'express-basic-auth';
import helmet from 'helmet';
import * as csurf from 'csurf';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.use(csurf()); // CSRF protection
  app.use(helmet()); // helps with XSS attacks
  app.getHttpAdapter().getInstance().disable('x-powered-by'); // Hide framework used =

  app.use(express.json({
    verify: (req: IncomingMessage, res: ServerResponse, buf: Buffer, encoding: string) => {
      if (req.url && req.url.startsWith('/stripe/webhook')) {
        (req as any).rawBody = buf.toString(encoding as BufferEncoding || 'utf8');
      }
    }
  }));

  app.use(
    '/docs',
    basicAuth({
      challenge: true,
      users: { [process.env.SWAGGER_USERNAME]: process.env.SWAGGER_PASSWORD },
    }),
  );

  app.use(cookieParser());

  const config = new DocumentBuilder()
    .setTitle('Nest.js SaaS Boilerplate')
    .setDescription('A boilerplate designed to help you get started with your SaaS project using Nest.js, MongoDB, and Stripe.')
    .setVersion('1.12')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  
  await app.listen(3000);
  Logger.log(`Application is running on: ${await app.getUrl()}`);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
