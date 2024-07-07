import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type UserDocument = User & Document;

@Schema()
export class User {
    @ApiProperty({ example: 'john.doe@example.com' })
    @Prop({ required: true, unique: true })
    email: string;

    @ApiProperty({ example: 'password123' })
    @Prop({ required: false })
    password: string;

    @ApiProperty({ example: 'John' })
    @Prop()
    firstName: string;

    @ApiProperty({ example: 'Doe' })
    @Prop()
    lastName: string;

    @ApiProperty({ example: 'https://example.com/picture.jpg' })
    @Prop()
    picture: string;

    @ApiProperty({ example: 'google' })
    @Prop()
    authProvider: string;

    @ApiProperty({ example: 'cus_1234567890' })
    @Prop()
    stripeCustomerId: string;

    @ApiProperty({ example: 'premium' })
    @Prop()
    subscription: string;

    @ApiProperty({ example: '2023-12-31T23:59:59Z' })
    @Prop()
    subscriptionExpires: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
