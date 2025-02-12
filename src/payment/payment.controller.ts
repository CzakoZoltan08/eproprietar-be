import { Controller, Post, Body, Res } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create')
  createPayment(@Body() body: { orderId: string; amount: string }) {
    const returnUrl = 'https://eproprietar-fe.onrender.com/payment-success';
    const confirmUrl = 'https://eproprietar-fe.onrender.com/payment/confirm';

    return this.paymentService.generatePaymentRequest(body.orderId, body.amount, returnUrl, confirmUrl);
  }

  @Post('confirm')
  confirmPayment(@Body() body, @Res() res) {
    console.log('Payment confirmation received:', body);
    res.set('Content-Type', 'application/xml');
    res.send('<response><message>OK</message></response>');
  }
}