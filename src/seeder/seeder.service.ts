import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PackageAudience, PaymentPackageType, PromotionPackageType } from 'src/payment/enums/announcement-payment.enums';

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

  /**
   * Insert each AnnouncementPackage if its packageType is not already in the DB.
   */
  async seedPackages() {
    const repo = this.dataSource.getRepository(AnnouncementPackage);

    // Define “canonical” list of packages to ensure are present
    const desired: Partial<AnnouncementPackage>[] = [
      {
        label: 'Free Package',
        price: 0,
        currency: CurrencyType.EURO,
        durationDays: 3,
        packageType: PaymentPackageType.FREE,
        targetAudience: PackageAudience.NORMAL,
      },
      {
        label: '7 Days Package',
        price: 7,
        currency: CurrencyType.EURO,
        durationDays: 7,
        packageType: PaymentPackageType.DAYS_7,
        targetAudience: PackageAudience.NORMAL,
      },
      {
        label: '15 Days Package',
        price: 15,
        currency: CurrencyType.EURO,
        durationDays: 15,
        packageType: PaymentPackageType.DAYS_15,
        targetAudience: PackageAudience.NORMAL,
      },
      {
        label: 'Unlimited Package',
        price: 18,
        currency: CurrencyType.EURO,
        durationDays: null,
        packageType: PaymentPackageType.UNLIMITED,
        targetAudience: PackageAudience.NORMAL,
      },
      {
        label: '20 Days Package',
        price: 20,
        currency: CurrencyType.EURO,
        durationDays: 20,
        packageType: PaymentPackageType.DAYS_20,
        targetAudience: PackageAudience.AGENCY,
      },
      {
        label: '3 Months Ensemble',
        price: 450,
        currency: CurrencyType.EURO,
        durationDays: 90,
        packageType: PaymentPackageType.MONTHS_3,
        targetAudience: PackageAudience.ENSEMBLE,
      },
      {
        label: '6 Months Ensemble',
        price: 600,
        currency: CurrencyType.EURO,
        durationDays: 180,
        packageType: PaymentPackageType.MONTHS_6,
        targetAudience: PackageAudience.ENSEMBLE,
      },
      {
        label: '12 Months Ensemble',
        price: 900,
        currency: CurrencyType.EURO,
        durationDays: 365,
        packageType: PaymentPackageType.MONTHS_12,
        targetAudience: PackageAudience.ENSEMBLE,
      },
    ];

    // Fetch all existing packageType values in the DB
    const existingRows = await repo.find({
      select: ['packageType'] as (keyof AnnouncementPackage)[],
    });
    const existingTypes = new Set(existingRows.map((row) => row.packageType));

    // Filter out any that already exist
    const toInsert = desired.filter(
      (pkg) => !existingTypes.has(pkg.packageType!)
    );

    if (toInsert.length > 0) {
      await repo.save(toInsert);
      this.logger.log(`Seeded ${toInsert.length} missing announcement package(s).`);
    } else {
      this.logger.log('No new announcement packages to seed.');
    }
  }

  /**
   * Insert each PromotionPackage if its promotionType is not already in the DB.
   */
  async seedPromotions() {
    const repo = this.dataSource.getRepository(PromotionPackage);

    const desired: Partial<PromotionPackage>[] = [
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

    // Fetch all existing promotionType values
    const existingRows = await repo.find({
      select: ['promotionType'] as (keyof PromotionPackage)[],
    });
    const existingTypes = new Set(existingRows.map((row) => row.promotionType));

    const toInsert = desired.filter(
      (promo) => !existingTypes.has(promo.promotionType!)
    );

    if (toInsert.length > 0) {
      await repo.save(toInsert);
      this.logger.log(`Seeded ${toInsert.length} missing promotion package(s).`);
    } else {
      this.logger.log('No new promotion packages to seed.');
    }
  }

  /**
   * Insert each Discount if its code is not already in the DB.
   */
  async seedDiscounts() {
    const repo = this.dataSource.getRepository(Discount);

    const now = new Date();
    const validFrom = new Date(now.setHours(0, 0, 0, 0)); // Start of today
    const validTo = new Date();
    validTo.setMonth(validTo.getMonth() + 1); // 1 month ahead
    validTo.setHours(23, 59, 59, 999); // End of that day

    const desired: Partial<Discount>[] = [
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

    // Fetch all existing discount codes
    const existingRows = await repo.find({
      select: ['code'] as (keyof Discount)[],
    });
    const existingCodes = new Set(existingRows.map((row) => row.code));

    const toInsert = desired.filter((disc) => !existingCodes.has(disc.code!));

    if (toInsert.length > 0) {
      await repo.save(toInsert);
      this.logger.log(`Seeded ${toInsert.length} missing discount(s).`);
    } else {
      this.logger.log('No new discounts to seed.');
    }
  }
}