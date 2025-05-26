import { Injectable, Logger } from '@nestjs/common';

import { AnnouncementPaymentService } from './services/announcement-payment.service';
import { AnnouncementsService } from '../announcements/announcements.service';
import { ConfigService } from '@nestjs/config';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CurrencyType } from '../public/enums/currencyTypes.enum';
import { MailService } from 'src/mail/mail.service';
import Stripe from 'stripe';
import axios from 'axios';

@Injectable()
export class PaymentService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly announcementsService: AnnouncementsService,
    private readonly announcementPaymentService: AnnouncementPaymentService,
    private readonly mailService: MailService,
  ) {
    this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY'), {
      apiVersion: '2025-01-27.acacia',
    });
  }

  async createPaymentSession(dto: CreatePaymentDto) {
    const {
      orderId,
      amount,
      currency,
      packageId,
      discountCode,
      originalAmount,
      promotionId,
      promotionDiscountCode,
      invoiceDetails,
    } = dto;
  
    try {
      if (amount === 0) {
        await this.announcementPaymentService.saveSuccessfulPayment({
          announcementId: orderId,
          packageId,
          amount: 0,
          originalAmount: 0,
          discountCode,
          currency: currency?.toLowerCase() as CurrencyType,
          promotionId,
          promotionDiscountCode,
        });

        await this.updateAnnouncementStatus(orderId, 'active');

        return {
          skipStripe: true,
          checkoutUrl: `${this.configService.get<string>('FRONTEND_URL')}/payment-status?orderId=${orderId}&success=true`,
        };
      }

      const invoiceDetailsPayload = JSON.stringify(invoiceDetails);

      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency,
              product_data: { name: `Payment for Announcement ${orderId}` },
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
          promotionId: promotionId || '',
          promotionDiscountCode: promotionDiscountCode || '',
          invoiceDetails: invoiceDetailsPayload, // Store invoice details as JSON
        },
        success_url: `${this.configService.get<string>('FRONTEND_URL')}/payment-status?orderId=${orderId}&success=true`,
        cancel_url: `${this.configService.get<string>('FRONTEND_URL')}/create-announcement?failed=true`,
      });

      return { skipStripe: false, checkoutUrl: session.url };
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
      }

      switch (event.type) {
        case 'checkout.session.completed': {
          if (!orderId) {
            this.logger.error(`Missing announcementId in webhook event.`);
            return { success: false, message: 'Missing announcementId' };
          }

          const amount = session?.amount_total ? session.amount_total / 100 : 0;
          const currency = session?.currency?.toLowerCase() as CurrencyType;

          await this.announcementPaymentService.saveSuccessfulPayment({
            announcementId: orderId,
            packageId: metadata.packageId,
            amount: amount,
            originalAmount: metadata.originalAmount ? parseFloat(metadata.originalAmount) : undefined,
            discountCode: metadata.discountCode || undefined,
            currency: currency,
            promotionId: metadata.promotionId || undefined,
            promotionDiscountCode: metadata.promotionDiscountCode || undefined,
          });

          await this.updateAnnouncementStatus(orderId, 'active');
        
          // Parse invoice details from metadata
          const invoiceDetails = metadata.invoiceDetails
            ? JSON.parse(metadata.invoiceDetails)
            : null;

            const announcement = await this.announcementsService.findOne(orderId);
            if (announcement) {
              const announcementUrl = `${this.configService.get<string>('FRONTEND_URL')}/announcement/${orderId}`;

              if (announcement.user.email && announcement.user.firstName) {
                try {
                  await this.mailService.sendAnnouncementConfirmation(
                    announcement.user.email,
                    announcement.user.firstName,
                    announcementUrl
                  );
                } catch (emailError) {
                  this.logger.warn(`Failed to send announcement email: ${(emailError as Error).message}`);
                }
              }
            }
            
        
          if (invoiceDetails) {
            await this.sendInvoiceToSmartBill(invoiceDetails, amount, currency);
          } else {
            this.logger.warn(`Invoice details missing for orderId ${orderId}`);
          }
        
          return { success: true, message: 'Payment successful and invoice sent' };
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

  private async sendInvoiceToSmartBill(
    invoiceDetails: {
      name: string;
      cif?: string;
      regCom?: string;
      address: string;
      city: string;
      country: string;
      email: string;
      isTaxPayer: boolean;
    },
    amount: number,
    currency: string
  ) {
    const smartBillUrl = this.configService.get('SMARTBILL_API_URL');
    const apiToken = this.configService.get('SMARTBILL_API_TOKEN');
    const username = this.configService.get('SMARTBILL_USERNAME');
    const cif = this.configService.get('SMARTBILL_COMPANY_CIF');
    const series = this.configService.get('SMARTBILL_SERIES');
    const dueDays = parseInt(this.configService.get('SMARTBILL_DUE_DAYS'), 10);

    const createPayload = (sendEmail: boolean) => ({
      companyVatCode: cif,
      client: {
        name: invoiceDetails.name,
        vatCode: invoiceDetails.cif || undefined,
        address: invoiceDetails.address,
        city: invoiceDetails.city,
        country: invoiceDetails.country,
        email: invoiceDetails.email,
        isTaxPayer: invoiceDetails.isTaxPayer,
        saveToDb: false,
      },
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + dueDays * 86400000).toISOString().split('T')[0],
      deliveryDate: new Date().toISOString().split('T')[0],
      seriesName: series,
      currency: currency.toUpperCase(),
      language: 'RO',
      isDraft: false,
      products: [
        {
          name: "Pachet afisare anunt",
          measuringUnitName: "buc",
          quantity: 1,
          price: amount,
          currency: currency.toUpperCase(),
          isTaxIncluded: true,
          taxPercentage: 0,
          isDiscount: false,
          saveToDb: false,
          isService: true,
        },
      ],
      sendEmail,
    });

    try {
      const payloadWithEmail = createPayload(true);
      const response = await axios.post(`${smartBillUrl}/SBORO/api/invoice`, payloadWithEmail, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(`${username}:${apiToken}`).toString('base64')}`,
        },
      });

      this.logger.log(`Invoice successfully created with email. Number: ${response.data.number}`);
    } catch (error) {
      this.logger.warn(`Failed to send invoice with email: ${(error as Error).message}`);
      try {
        const payloadWithoutEmail = createPayload(false);
        const response = await axios.post(`${smartBillUrl}/SBORO/api/invoice`, payloadWithoutEmail, {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Basic ${Buffer.from(`${username}:${apiToken}`).toString('base64')}`,
          },
        });

        this.logger.log(`Invoice created without sending email. Number: ${response.data.number}`);
      } catch (retryError) {
        this.logger.error(`SmartBill Invoice Retry Failed: ${(retryError as Error).message}`);
        throw new Error('Invoice creation failed after retry');
      }
    }
  } 
}