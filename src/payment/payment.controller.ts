import { Controller, Post, Body, Headers, Req, Res, Get, Query, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { PaymentService } from './payment.service';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PricingService } from './services/pricing.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PackageAudience } from './enums/announcement-payment.enums';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly pricingService: PricingService,
    private configService: ConfigService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('/announcement-packages')
  async getAnnouncementPackages(
    @Query('userId') userId: string,
    @Query('audience') audience: PackageAudience = PackageAudience.NORMAL
  ) {
    if (!userId) return null;
    return this.pricingService.getAnnouncementPackages(userId, audience);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/promotion-packages')
  async getPromotionPackages(@Query('userId') userId: string) {
    if (!userId) return null;
    return this.pricingService.getPromotionPackages(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createPayment(@Body() body: CreatePaymentDto) {
    return this.paymentService.createPaymentSession(body);
  }

  @Post('webhook')
  async confirmPayment(
    @Headers('stripe-signature') sig: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    const endpointSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    let event: Stripe.Event;

    try {
      if (!Buffer.isBuffer(req.body)) {
        console.error('❌ Webhook Error: Body is not a Buffer');
        return res.status(400).send('Webhook Error: Body is not a Buffer');
      }

      event = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY')).webhooks.constructEvent(
        req.body, // Use raw Buffer directly
        sig,
        endpointSecret
      );

      console.log('✅ Webhook event received:', event.type);

      const response = await this.paymentService.handleWebhookEvent(event);
      return res.status(200).json(response);
    } catch (err) {
      const message = (err as Error).message;
      console.error(`❌ Webhook Error: ${message}`);
      return res.status(400).send(`Webhook Error: ${message}`);
    }
  }
}