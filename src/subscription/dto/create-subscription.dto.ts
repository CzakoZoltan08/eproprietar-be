export class CreateSubscriptionDto {
  stripeId: string;
  expiresAt: Date;
  shippingAddress: string;
  price: number;
  discount: number;
}
