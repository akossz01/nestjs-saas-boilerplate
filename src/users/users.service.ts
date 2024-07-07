import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './user.schema';
import { StripeService } from 'src/stripe/stripe.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly stripeService: StripeService,
  ) { }

  async createOAuthUser(thirdPartyUser: any): Promise<UserDocument> {
    const user = new this.userModel({
      email: thirdPartyUser.email,
      firstName: thirdPartyUser.firstName,
      lastName: thirdPartyUser.lastName,
      picture: thirdPartyUser.picture,
      authProvider: 'google',
    });

    try {
      const createdUser = await user.save();
      if (this.stripeService.freePlan) {
        await this.stripeService.enableFreePrivileges(createdUser);
      }
      return createdUser;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  async createUser(email: string, password: string): Promise<UserDocument> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new this.userModel({ email, password: hashedPassword });
    try {
      const createdUser = await user.save();
      if (this.stripeService.freePlan) {
        await this.stripeService.enableFreePrivileges(createdUser);
      }
      return createdUser;
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
