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
  
    const now = new Date();
    const validFrom = new Date(now.setHours(0, 0, 0, 0)); // Start of today
    const validTo = new Date();
    validTo.setMonth(validTo.getMonth() + 1);             // 1 month ahead
    validTo.setHours(23, 59, 59, 999);                    // End of day
  
    const discounts: Partial<Discount>[] = [
      {
        code: 'PKG15OFF',
        percentage: 20,
        description: '20% off 15-day package',
        validFrom,
        validTo,
        applicablePackageTypes: [PaymentPackageType.DAYS_15],
        active: true,
      },
      {
        code: 'PROMO15SAVE',
        fixedAmount: 2,
        description: 'Save 2€ on 15-day promotion',
        validFrom,
        validTo,
        applicablePromotionTypes: [PromotionPackageType.PROMOTE_15_DAYS],
        active: true,
      },
    ];
  
    await repo.save(discounts);
    this.logger.log('✅ Seeded discounts with valid date ranges.');
  }
}