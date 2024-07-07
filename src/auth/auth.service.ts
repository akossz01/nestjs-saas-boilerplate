import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/user.schema';
import { MailerService } from 'src/mailer/mailer.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private mailerService: MailerService,
    ) { }

    async validateOAuthLogin(thirdPartyUser: any, provider: string): Promise<any> {
        let user = await this.usersService.findByEmail(thirdPartyUser.email);
        if (!user) {
            user = await this.usersService.createOAuthUser(thirdPartyUser);
        }
        const payload = { email: user.email, sub: user._id };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.usersService.findByEmail(email);
        if (user && await bcrypt.compare(password, (user as UserDocument).password)) {
            const { password, ...result } = user.toObject();
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user.userId, stripeCustomerId: user.stripeCustomerId };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }    

    async registerUser(email: string, password: string) {
        const user = await this.usersService.createUser(email, password);
        await this.mailerService.sendThankYouEmail(email);
        return user;
    }

    async requestPasswordReset(email: string) {
        const user = await this.usersService.findByEmail(email);
        if (user) {
            const token = this.jwtService.sign({ email }, { expiresIn: '1h' });
            await this.mailerService.sendResetPasswordEmail(email, token);
        }
    }

    async requestEmailConfirmation(email: string) {
        const user = await this.usersService.findByEmail(email);
        if (user) {
            const token = this.jwtService.sign({ email }, { expiresIn: '1h' });
            await this.mailerService.sendConfirmEmail(email, token);
        }
    }

    async resetPassword(token: string, newPassword: string) {
        try {
            const { email } = this.jwtService.verify(token);
            const user = await this.usersService.findByEmail(email);
            if (user) {
                user.password = await bcrypt.hash(newPassword, 10);
                await user.save();
            }
        } catch (error) {
            throw new Error('Invalid or expired token');
        }
    }

    async confirmEmail(token: string) {
        try {
            const { email } = this.jwtService.verify(token);
            const user = await this.usersService.findByEmail(email);
            if (user) {
                // Handle email confirmation logic (e.g., update user record to mark email as confirmed)
            }
        } catch (error) {
            throw new Error('Invalid or expired token');
        }
    }
}
