import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

  async createOAuthUser(thirdPartyUser: any): Promise<UserDocument> {
    const user = new this.userModel({
      email: thirdPartyUser.email,
      firstName: thirdPartyUser.firstName,
      lastName: thirdPartyUser.lastName,
      picture: thirdPartyUser.picture,
      authProvider: 'google',
    });
    return user.save();
  }

  async createUser(email: string, password: string): Promise<UserDocument> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new this.userModel({ email, password: hashedPassword });
    try {
      return await user.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  async findByEmail(email: string): Promise<UserDocument | undefined> {
    return this.userModel.findOne({ email }).exec();
  }
}
