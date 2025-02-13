import { Controller, Post, Body, Headers, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { PaymentService } from './payment.service';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private configService: ConfigService
  ) {}

  /**
   * Create a new payment session
   */
  @Post('create')
  async createPayment(@Body() body: { orderId: string; amount: number; currency: string }) {
    return this.paymentService.createPaymentSession(body.orderId, body.amount, body.currency);
  }

  /**
   * Handle Stripe Webhook Events
   */
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
        req.rawBody, // ✅ Use req.rawBody instead of req.body
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