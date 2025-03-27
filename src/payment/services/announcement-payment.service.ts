import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CurrencyType } from "src/public/enums/currencyTypes.enum";
import { AnnouncementPayment } from "../entities/announcement-payment.entity";
import { Announcement } from "src/announcements/entities/announcement.entity";
import { Discount } from "../entities/discount.entity";
import { AnnouncementPackage } from "../entities/announcement-package.entity";
import { Repository } from "typeorm";
import { PromotionPackage } from "../entities/promotion-package.entity";

@Injectable()
export class AnnouncementPaymentService {
  constructor(
    @InjectRepository(AnnouncementPayment)
    private readonly paymentRepo: Repository<AnnouncementPayment>,
    @InjectRepository(Announcement)
    private readonly announcementRepo: Repository<Announcement>,
    @InjectRepository(Discount)
    private readonly discountRepo: Repository<Discount>,
    @InjectRepository(AnnouncementPackage)
    private readonly packageRepo: Repository<AnnouncementPackage>,
    @InjectRepository(PromotionPackage)
    private readonly promotionPackageRepo: Repository<PromotionPackage>
  ) {}

  async saveSuccessfulPayment(data: {
    announcementId: string;
    packageId: string;
    amount: number;
    originalAmount?: number;
    discountCode?: string;
    currency: CurrencyType;
    promotionId?: string,
    promotionDiscountCode?: string
  }) {
    const announcement = await this.announcementRepo.findOneByOrFail({ id: data.announcementId });
    const pkg = await this.packageRepo.findOneByOrFail({ id: data.packageId });
    const discount = data.discountCode
      ? await this.discountRepo.findOne({ where: { code: data.discountCode } })
      : null;

    const now = new Date();

    const promotion = data.promotionId
      ? await this.promotionPackageRepo.findOneByOrFail({ id: data.promotionId })
      : null;

    const packageEndDate = pkg.durationDays
    ? new Date(now.getTime() + pkg.durationDays * 86400000)
    : null;
    
    const promotionEndDate = promotion?.durationDays
      ? new Date(now.getTime() + promotion.durationDays * 86400000)
      : null;

    const promotionDiscount = data.promotionDiscountCode
      ? await this.discountRepo.findOne({ where: { code: data.promotionDiscountCode } })
      : null;

    const payment = this.paymentRepo.create({
      announcement,
      currency: data.currency,
      amount: data.amount,
      originalAmount: data.originalAmount,
      discountAmount: data.originalAmount ? data.originalAmount - data.amount : null,
      discount: discount,
      promotion: promotion,
      package: pkg,
      startDate: now,
      packageEndDate: packageEndDate,
      promotionEndDate: promotionEndDate,
      promotionDiscount: promotionDiscount
    });

    await this.paymentRepo.save(payment);
  }
}