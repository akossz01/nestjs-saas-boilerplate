import { Controller, Post, Body, Res, BadRequestException, Get, UseGuards, Req } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) { }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {
    // Initiates the Google OAuth2 login flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    // Handles the Google OAuth2 callback and redirects
    const jwt = await this.authService.login(req.user);
    res.cookie('jwt', jwt.access_token, { httpOnly: true, secure: true });
    return res.redirect('/');
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Res() res: Response) {
    if (!registerDto.email || !registerDto.password) {
      throw new BadRequestException('Email and password are required');
    }
    const user = await this.usersService.createUser(registerDto.email, registerDto.password);
    const token = await this.authService.login(user);
    res.cookie('jwt', token.access_token, { httpOnly: true, secure: true });
    return res.send({ message: 'User registered successfully' });
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    if (user) {
      const token = await this.authService.login(user);
      res.cookie('jwt', token.access_token, { httpOnly: true, secure: true });
      return res.send({ message: 'Login successful' });
    }
    return res.status(401).send({ message: 'Invalid credentials' });
  }

  @Post('logout')
  async logout(@Res() res: Response) {
    res.clearCookie('jwt');
    return res.send({ message: 'Logout successful' });
  }

  @Post('request-reset-password')
  async requestResetPassword(@Body('email') email: string, @Res() res: Response) {
    await this.authService.requestPasswordReset(email);
    return res.send({ message: 'Password reset email sent' });
  }

  @Post('request-confirm-email')
  async requestConfirmEmail(@Body('email') email: string, @Res() res: Response) {
    await this.authService.requestEmailConfirmation(email);
    return res.send({ message: 'Confirmation email sent' });
  }

  @Post('reset-password')
  async resetPassword(@Body('token') token: string, @Body('newPassword') newPassword: string, @Res() res: Response) {
    try {
      await this.authService.resetPassword(token, newPassword);
      return res.send({ message: 'Password has been reset' });
    } catch (error) {
      return res.status(400).send({ message: 'Invalid or expired token' });
    }
  }

  @Post('confirm-email')
  async confirmEmail(@Body('token') token: string, @Res() res: Response) {
    try {
      await this.authService.confirmEmail(token);
      return res.send({ message: 'Email has been confirmed' });
    } catch (error) {
      return res.status(400).send({ message: 'Invalid or expired token' });
    }
  }
}
