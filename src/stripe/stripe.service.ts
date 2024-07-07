import { Injectable, Inject, Logger } from '@nestjs/common';
import { Stripe } from 'stripe';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/user.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class StripeService {
    private readonly logger = new Logger(StripeService.name);

    constructor(
        @Inject('STRIPE_CLIENT') private readonly stripeClient: Stripe,
        private readonly jwtService: JwtService,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
    ) { }

    async listProducts() {
        return this.stripeClient.products.list();
    }

    async createStripeCustomer(user: any) {
        return this.stripeClient.customers.create({
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
        });
    }

    async createCheckoutSession(token: string, priceId: string, successUrl: string, cancelUrl: string) {
        const user = this.jwtService.decode(token) as any;

        let customer;
        try {
            customer = await this.stripeClient.customers.retrieve(user.stripeCustomerId);
        } catch (error) {
            customer = await this.createStripeCustomer(user);
            // Save the customer ID to your user model (this depends on how you manage your users)
            user.stripeCustomerId = customer.id;
            
            await this.userModel.findOneAndUpdate(
                { email: user.email },
                {
                    $set: {
                        stripeCustomerId: customer.id,
                    },
                }
            );
        }

        return this.stripeClient.checkout.sessions.create({
            payment_method_types: ['card'],
            customer: customer.id,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: successUrl,
            cancel_url: cancelUrl,
            allow_promotion_codes: true,
            billing_address_collection: 'required',
            tax_id_collection: {
                enabled: true,
            },
            customer_update: {
                name: 'auto',
                address: 'auto',
            },
        });
    }


    async handleWebhook(event: Stripe.Event) {
        this.logger.log(`Received event: ${event.type}`);

        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object as Stripe.Checkout.Session;
                // Handle successful checkout session
                this.logger.log(`Checkout session completed: ${session.id}`);
                await this.upgradeAccount(session);
                break;
            case 'invoice.payment_succeeded':
                const invoice = event.data.object as Stripe.Invoice;
                // Handle successful payment
                this.logger.log(`Invoice payment succeeded: ${invoice.id}`);
                break;
            case 'invoice.payment_failed':
                // Handle failed payment
                this.logger.log('Invoice payment failed');
                break;
            case 'customer.subscription.deleted':
                // Handle subscription deletion
                this.logger.log('Customer subscription deleted');
                break;
            case 'customer.deleted':
                // Handle customer deletion
                this.logger.log('Customer deleted');
                break;
            default:
                this.logger.log(`Unhandled event type ${event.type}`);
        }
    }

    constructWebhookEvent(payload: string, sig: string, secret: string): Stripe.Event {
        return this.stripeClient.webhooks.constructEvent(payload, sig, secret);
    }

    async upgradeAccount(session: Stripe.Checkout.Session) {
        const subscription = await this.stripeClient.subscriptions.retrieve(session.subscription as string);

        // Extract necessary details
        const customerId = session.customer as string;
        const product = subscription.items.data[0].price.product;
        const subscriptionExpires = new Date(subscription.current_period_end * 1000);

        this.logger.log(`Customer ID: ${customerId}, Product: ${product}, Expires: ${subscriptionExpires}`);

        // Find the user and update subscription details
        const updatedUser = await this.userModel.findOneAndUpdate(
            { stripeCustomerId: customerId },
            {
                $set: {
                    subscription: product as string,
                    subscriptionExpires,
                    stripeCustomerId: customerId, // Ensure stripeCustomerId is set
                },
            },
            { new: true }
        );

        if (updatedUser) {
            this.logger.log(`User subscription upgraded: ${customerId}, Product: ${product}, Expires: ${subscriptionExpires}`);
        } else {
            this.logger.log(`User not found for customerId: ${customerId}`);
        }
    }
}
