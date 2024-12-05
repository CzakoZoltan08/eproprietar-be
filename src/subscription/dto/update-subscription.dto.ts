import { PickType } from '@nestjs/mapped-types';
import { CreateSubscriptionDto } from './create-subscription.dto';

export class UpdateSubscriptionDto extends PickType(CreateSubscriptionDto, [
  'expiresAt',
  'shippingAddress',
  'price',
  'discount'
]) {
  expiresAt: Date;
  shippingAddress: string;
  price: number;
  discount: number;
}
