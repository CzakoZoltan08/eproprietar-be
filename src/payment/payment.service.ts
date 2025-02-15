import { Injectable, Logger } from '@nestjs/common';

import { AnnouncementsService } from '../announcements/announcements.service';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(PaymentService.name);

  constructor(private readonly configService: ConfigService, private readonly announcementsService: AnnouncementsService) {
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
      let orderId: string | null = null;
  
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        orderId = session.metadata?.orderId;
      } else if (event.type.startsWith('payment_intent.')) {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
  
        // Fetch associated Checkout Session to get metadata
        const session = await this.stripe.checkout.sessions.list({
          payment_intent: paymentIntent.id,
          limit: 1,
        });
  
        if (session.data.length > 0) {
          orderId = session.data[0].metadata?.orderId;
        }
      }
  
      if (!orderId) {
        this.logger.error(`Missing announcementId in webhook event.`);
        return { success: false, message: 'Missing announcementId' };
      }
  
      switch (event.type) {
        case 'checkout.session.completed':
          this.logger.log(`✅ Payment successful for Announcement ID: ${orderId}`);
          await this.updateAnnouncementStatus(orderId, 'active');
          return { success: true, message: 'Payment successful' };
  
        case 'payment_intent.payment_failed':
        case 'checkout.session.expired':
          this.logger.warn(`❌ Payment failed/expired for Announcement ID: ${orderId}`);
          return { success: false, message: 'Payment failed/expired' };
  
        default:
          return { success: false, message: `Unhandled event type: ${event.type}` };
      }
    } catch (error) {
      this.logger.error(`Error handling webhook event: ${(error as Error).message}`);
      throw new Error('Failed to process webhook event');
    }
  }  

  /**
   * Update announcement status after successful payment
   */
  private async updateAnnouncementStatus(announcementId: string, status: string) {
    try {
      this.logger.log(`Updating announcement ${announcementId} to status: ${status}`);
      await this.announcementsService.update(announcementId, { status });
    } catch (error) {
      this.logger.error(`Failed to update announcement status: ${(error as Error).message}`);
    }
  }

  /**
   * Delete announcement on failed/expired payment
   */
  private async deleteAnnouncement(announcementId: string) {
    try {
      this.logger.log(`Deleting announcement: ${announcementId} due to failed payment`);
      await this.announcementsService.remove(announcementId);
    } catch (error) {
      this.logger.error(`Failed to delete announcement: ${(error as Error).message}`);
    }
  }
}