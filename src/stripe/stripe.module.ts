import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Stripe } from 'stripe';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { JwtModule } from '@nestjs/jwt';
import { User, UserSchema } from '../users/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { MailerService } from 'src/mailer/mailer.service';

@Module({
    imports: [
        ConfigModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '60m' },
        }),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ],
    providers: [
        {
            provide: 'STRIPE_CLIENT',
            useFactory: (configService: ConfigService) => {
                return new Stripe(configService.get<string>('STRIPE_SECRET_KEY'), {
                    apiVersion: '2024-06-20',
                });
            },
            inject: [ConfigService],
        },
        StripeService,
        MailerService,
    ],
    controllers: [StripeController],
    exports: [StripeService],
})
export class StripeModule { }
