import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { StripeModule } from 'src/stripe/stripe.module';

@Module({
    imports: [
      MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
      StripeModule,
    ],
    providers: [UsersService],
    controllers: [UsersController],
    exports: [UsersService],
})
export class UsersModule {}
