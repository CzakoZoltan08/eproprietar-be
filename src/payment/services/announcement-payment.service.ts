import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CurrencyType } from "src/public/enums/currencyTypes.enum";
import { AnnouncementPayment } from "../entities/announcement-payment.entity";
import { Announcement } from "src/announcements/entities/announcement.entity";
import { Discount } from "../entities/discount.entity";
import { AnnouncementPackage } from "../entities/announcement-package.entity";
import { Repository } from "typeorm";

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
    private readonly packageRepo: Repository<AnnouncementPackage>
  ) {}

  async saveSuccessfulPayment(data: {
    announcementId: string;
    packageId: string;
    amount: number;
    originalAmount?: number;
    discountCode?: string;
    currency: CurrencyType;
  }) {
    const announcement = await this.announcementRepo.findOneByOrFail({ id: data.announcementId });
    const pkg = await this.packageRepo.findOneByOrFail({ id: data.packageId });
    const discount = data.discountCode
      ? await this.discountRepo.findOne({ where: { code: data.discountCode } })
      : null;

    const now = new Date();
    const endDate = pkg.durationDays ? new Date(now.getTime() + pkg.durationDays * 86400000) : null;

    const payment = this.paymentRepo.create({
      announcement,
      currency: data.currency,
      amount: data.amount,
      originalAmount: data.originalAmount,
      discountAmount: data.originalAmount ? data.originalAmount - data.amount : null,
      discount,
      packageType: pkg.packageType,
      promotionType: pkg.promotionType,
      startDate: now,
      endDate,
    });

    await this.paymentRepo.save(payment);
  }
}