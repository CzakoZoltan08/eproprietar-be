import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { Subscription } from './entities/subscription.entity';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
  ) {}
  create(createSubscriptionDto: CreateSubscriptionDto) {
    return this.subscriptionRepository.save(createSubscriptionDto);
  }

  update(stripeId: string, updateSubscriptionDto: UpdateSubscriptionDto) {
    return this.subscriptionRepository.update({ stripeId }, updateSubscriptionDto);
  }
}
