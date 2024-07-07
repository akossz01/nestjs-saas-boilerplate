import { Controller, Get, Post, Body, Req, Res, HttpStatus, UseGuards } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';

@ApiTags('stripe')
@Controller('stripe')
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  @Get('products')
  async listProducts(@Res() res: Response) {
    const products = await this.stripeService.listProducts();
    return res.status(HttpStatus.OK).json(products);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('create-checkout-session')
  async createCheckoutSession(@Body() body, @Req() req: Request, @Res() res: Response) {
    try {
      const { priceId } = body;
      const successUrl = this.configService.get<string>('STRIPE_SUCCESS_URL');
      const cancelUrl = this.configService.get<string>('STRIPE_CANCEL_URL');
      
      if (!priceId || !successUrl || !cancelUrl) {
        return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Invalid request body' });
      }

      const token = req.cookies.jwt;
      if (!token) {
        return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' });
      }

      const session = await this.stripeService.createCheckoutSession(token, priceId, successUrl, cancelUrl);
      return res.status(HttpStatus.OK).json({ sessionId: session.id, sessionUrl: session.url });
    } catch (error) {
      console.error('Error creating checkout session:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error', error: error.message });
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('create-customer-portal-session')
  async createCustomerPortalSession(@Body() body, @Req() req: Request, @Res() res: Response) {
    const returnUrl = this.configService.get<string>('STRIPE_RETURN_URL');
    const token = req.cookies.jwt;
    const user = this.jwtService.decode(token) as any;
    
    if (!user.stripeCustomerId) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: 'No Stripe customer ID found' });
    }

    try {
      const session = await this.stripeService.createCustomerPortalSession(user.stripeCustomerId, returnUrl);
      return res.status(HttpStatus.OK).json({ url: session.url });
    } catch (error) {
      console.error('Error creating customer portal session:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error', error: error.message });
    }
  }

  @Post('webhook')
  async handleWebhook(@Req() req: Request, @Res() res: Response) {
    const sig = req.headers['stripe-signature'];
    const secret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    let event;

    try {
      if (Array.isArray(sig)) {
        throw new Error('Unexpected array of signatures');
      }
      event = this.stripeService.constructWebhookEvent((req as any).rawBody, sig, secret);
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`, err.message);
      return res.sendStatus(HttpStatus.BAD_REQUEST);
    }

    await this.stripeService.handleWebhook(event);
    res.sendStatus(HttpStatus.OK);
  }
}
