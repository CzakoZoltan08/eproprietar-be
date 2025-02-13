import { Injectable, Logger } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(PaymentService.name);

  constructor(private readonly configService: ConfigService) {
    this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY'), {
      apiVersion: '2025-01-27.acacia',
    });
  }

  /**
   * Create a Stripe Checkout session
   */
  async createPaymentSession(orderId: string, amount: number, currency: string) {
    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency,
              product_data: {
                name: `Payment for Announcement ${orderId}`,
              },
              unit_amount: amount * 100, // Convert to cents
            },
            quantity: 1,
          },
        ],
        metadata: { orderId },
        success_url: `${this.configService.get<string>('FRONTEND_URL')}/payment-status?orderId=${orderId}&success=true`,
        cancel_url: `${this.configService.get<string>('FRONTEND_URL')}/create-announcement?failed=true`,
      });

      return { checkoutUrl: session.url };
    } catch (error) {
      this.logger.error(`Error creating payment session: ${(error as Error).message}`);
      throw new Error('Failed to create payment session');
    }
  }

  /**
   * Handle Stripe Webhooks
   */
  async handleWebhookEvent(event: Stripe.Event) {
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          const session = event.data.object as Stripe.Checkout.Session;
          this.logger.log(`Payment successful for Order ID: ${session.metadata.orderId}`);

          // Activate announcement in the database
          await this.activateAnnouncement(session.metadata.orderId.replace("ANN_", ""));
          return { success: true, message: 'Payment successful' };

        case 'payment_intent.payment_failed':
          this.logger.warn(`Payment failed: ${event.data.object.id}`);
          return { success: false, message: 'Payment failed' };

        default:
          this.logger.warn(`Unhandled event type: ${event.type}`);
          return { success: false, message: `Unhandled event type: ${event.type}` };
      }
    } catch (error) {
      this.logger.error(`Error handling webhook event: ${(error as Error).message}`);
      throw new Error('Failed to process webhook event');
    }
  }

  /**
   * Mock function to activate the announcement
   */
  private async activateAnnouncement(announcementId: string) {
    this.logger.log(`Activating announcement: ${announcementId}`);
    // TODO: Add logic to update the announcement in the database
  }
}