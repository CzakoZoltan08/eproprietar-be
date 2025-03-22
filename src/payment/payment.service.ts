import { Injectable, Logger } from '@nestjs/common';

import { AnnouncementPaymentService } from './services/announcement-payment.service';
import { AnnouncementsService } from '../announcements/announcements.service';
import { ConfigService } from '@nestjs/config';
import { CurrencyType } from '../public/enums/currencyTypes.enum';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly announcementsService: AnnouncementsService,
    private readonly announcementPaymentService: AnnouncementPaymentService
  ) {
    this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY'), {
      apiVersion: '2025-01-27.acacia',
    });
  }

  async createPaymentSession(
    orderId: string,
    amount: number,
    currency: string,
    packageId: string,
    discountCode?: string,
    originalAmount?: number,
  ) {
    try {
      if (amount === 0) {
        await this.announcementPaymentService.saveSuccessfulPayment({
          announcementId: orderId,
          packageId,
          amount: 0,
          originalAmount: 0,
          discountCode,
          currency: currency.toUpperCase() as CurrencyType,
        });

        await this.updateAnnouncementStatus(orderId, 'active');

        return {
          skipStripe: true,
          checkoutUrl: `${this.configService.get<string>('FRONTEND_URL')}/payment-status?orderId=${orderId}&success=true`,
        };
      }

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
              unit_amount: amount * 100,
            },
            quantity: 1,
          },
        ],
        metadata: {
          orderId,
          packageId,
          discountCode: discountCode || '',
          originalAmount: originalAmount?.toString() || '',
        },
        success_url: `${this.configService.get<string>('FRONTEND_URL')}/payment-status?orderId=${orderId}&success=true`,
        cancel_url: `${this.configService.get<string>('FRONTEND_URL')}/create-announcement?failed=true`,
      });

      return { checkoutUrl: session.url };
    } catch (error) {
      this.logger.error(`Error creating payment session: ${(error as Error).message}`);
      throw new Error('Failed to create payment session');
    }
  }

  async handleWebhookEvent(event: Stripe.Event) {
    try {
      let orderId: string | null = null;
      let metadata: any = {};
      let session: Stripe.Checkout.Session | null = null;

      if (event.type === 'checkout.session.completed') {
        session = event.data.object as Stripe.Checkout.Session;
        metadata = session.metadata;
        orderId = metadata?.orderId;
      } else if (event.type.startsWith('payment_intent.')) {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const sessions = await this.stripe.checkout.sessions.list({
          payment_intent: paymentIntent.id,
          limit: 1,
        });

        if (sessions.data.length > 0) {
          session = sessions.data[0];
          metadata = session.metadata;
          orderId = metadata?.orderId;
        }
      }

      if (!orderId) {
        this.logger.error(`Missing announcementId in webhook event.`);
        return { success: false, message: 'Missing announcementId' };
      }

      switch (event.type) {
        case 'checkout.session.completed': {
          const amount = session?.amount_total ? session.amount_total / 100 : 0;
          const currency = session?.currency?.toUpperCase() as CurrencyType;

          await this.announcementPaymentService.saveSuccessfulPayment({
            announcementId: orderId,
            packageId: metadata.packageId,
            amount,
            originalAmount: metadata.originalAmount ? parseFloat(metadata.originalAmount) : undefined,
            discountCode: metadata.discountCode || undefined,
            currency,
          });

          await this.updateAnnouncementStatus(orderId, 'active');
          return { success: true, message: 'Payment successful' };
        }

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