import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PaymentPackageType, PromotionPackageType } from 'src/payment/enums/announcement-payment.enums';

import { AnnouncementPackage } from 'src/payment/entities/announcement-package.entity';
import { CurrencyType } from 'src/public/enums/currencyTypes.enum';
import { DataSource } from 'typeorm';
import { Discount } from 'src/payment/entities/discount.entity';
import { PromotionPackage } from 'src/payment/entities/promotion-package.entity';

@Injectable()
export class SeederService implements OnModuleInit {
  private readonly logger = new Logger(SeederService.name);

  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit() {
    await this.seedPackages();
    await this.seedPromotions();
    await this.seedDiscounts();
  }

  async seedPackages() {
    const repo = this.dataSource.getRepository(AnnouncementPackage);

    const count = await repo.count();
    if (count > 0) return;

    const packages: Partial<AnnouncementPackage>[] = [
      {
        label: 'Free Package',
        price: 0,
        currency: CurrencyType.EURO,
        durationDays: 3,
        packageType: PaymentPackageType.FREE,
      },
      {
        label: '7 Days Package',
        price: 7,
        currency: CurrencyType.EURO,
        durationDays: 7,
        packageType: PaymentPackageType.DAYS_7,
      },
      {
        label: '15 Days Package',
        price: 15,
        currency: CurrencyType.EURO,
        durationDays: 15,
        packageType: PaymentPackageType.DAYS_15,
      },
      {
        label: 'Unlimited Package',
        price: 18,
        currency: CurrencyType.EURO,
        durationDays: null,
        packageType: PaymentPackageType.UNLIMITED,
      },
      {
        label: '3 Months Ensemble',
        price: 450,
        currency: CurrencyType.EURO,
        durationDays: 90,
        packageType: PaymentPackageType.MONTHS_3,
      },
      {
        label: '6 Months Ensemble',
        price: 600,
        currency: CurrencyType.EURO,
        durationDays: 180,
        packageType: PaymentPackageType.MONTHS_6,
      },
      {
        label: '12 Months Ensemble',
        price: 900,
        currency: CurrencyType.EURO,
        durationDays: 365,
        packageType: PaymentPackageType.MONTHS_12,
      },
    ];

    await repo.save(packages);
    this.logger.log('Seeded announcement packages.');
  }

  async seedPromotions() {
    const repo = this.dataSource.getRepository(PromotionPackage);

    const count = await repo.count();
    if (count > 0) return;

    const promotions: Partial<PromotionPackage>[] = [
      {
        label: 'Promote 7 Days',
        price: 5,
        currency: CurrencyType.EURO,
        durationDays: 7,
        promotionType: PromotionPackageType.PROMOTE_7_DAYS,
      },
      {
        label: 'Promote 15 Days',
        price: 7,
        currency: CurrencyType.EURO,
        durationDays: 15,
        promotionType: PromotionPackageType.PROMOTE_15_DAYS,
      },
      {
        label: 'Promote 30 Days',
        price: 10,
        currency: CurrencyType.EURO,
        durationDays: 30,
        promotionType: PromotionPackageType.PROMOTE_30_DAYS,
      },
    ];

    await repo.save(promotions);
    this.logger.log('Seeded promotion packages.');
  }

  async seedDiscounts() {
    const repo = this.dataSource.getRepository(Discount);

    const count = await repo.count();
    if (count > 0) return;

    const discounts: Partial<Discount>[] = [
      {
        code: 'LAUNCH10',
        percentage: 10,
        validFrom: new Date(),
        validTo: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        applicablePackageTypes: [PaymentPackageType.DAYS_15],
        applicablePromotionTypes: [PromotionPackageType.PROMOTE_30_DAYS],
      },
    ];

    await repo.save(discounts);
    this.logger.log('Seeded discounts.');
  }
}