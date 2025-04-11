import { Controller, Post, Body, Headers, Req, Res, Get, Query } from '@nestjs/common';
import { Response } from 'express';
import { PaymentService } from './payment.service';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PricingService } from './services/pricing.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PackageAudience } from './enums/announcement-payment.enums';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly pricingService: PricingService,
    private configService: ConfigService
  ) {}

  @Get('/announcement-packages')
  async getAnnouncementPackages(
    @Query('userId') userId: string,
    @Query('audience') audience: PackageAudience = PackageAudience.NORMAL
  ) {
    if (!userId) return null;
    return this.pricingService.getAnnouncementPackages(userId, audience);
  }

  @Get('/promotion-packages')
  async getPromotionPackages(@Query('userId') userId: string) {
    if (!userId) return null;
    return this.pricingService.getPromotionPackages(userId);
  }

  @Post('create')
  async createPayment(@Body() body: CreatePaymentDto) {
    return this.paymentService.createPaymentSession(body);
  }

  @Post('webhook')
  async confirmPayment(
    @Headers('stripe-signature') sig: string,
    @Req() req: Request & { rawBody?: Buffer },
    @Res() res: Response
  ) {
    const endpointSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    let event: Stripe.Event;

    try {
      if (!req.rawBody) {
        console.error('❌ Webhook Error: req.rawBody is missing');
        return res.status(400).send('Webhook Error: req.rawBody is missing');
      }

      event = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY')).webhooks.constructEvent(
        req.rawBody,
        sig,
        endpointSecret
      );

      console.log('✅ Webhook event received:', event);

      const response = await this.paymentService.handleWebhookEvent(event);
      return res.status(200).json(response);
    } catch (err) {
      const message = (err as Error).message;
      console.error(`❌ Webhook Error: ${message}`);
      return res.status(400).send(`Webhook Error: ${message}`);
    }
  }
}