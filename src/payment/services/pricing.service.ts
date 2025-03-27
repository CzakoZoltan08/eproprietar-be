import { Injectable } from "@nestjs/common";
import { AnnouncementPackage } from "../entities/announcement-package.entity";
import { Discount } from "../entities/discount.entity";
import { PromotionPackage } from "../entities/promotion-package.entity";
import { PaymentPackageType, PromotionPackageType } from "../enums/announcement-payment.enums";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class PricingService {
  constructor(
    @InjectRepository(AnnouncementPackage)
    private readonly packageRepo: Repository<AnnouncementPackage>,
    @InjectRepository(PromotionPackage)
    private readonly promotionRepo: Repository<PromotionPackage>,
    @InjectRepository(Discount)
    private readonly discountRepo: Repository<Discount>,
  ) {}

  async getAnnouncementPackages(userId: string) {
    const packages = await this.packageRepo.find({ where: { active: true } });

    const enhanced = await Promise.all(
      packages.map((p) => this.attachPackageDiscount(p, userId))
    );

    return enhanced;
  }

  async getPromotionPackages(userId: string) {
    const promotions = await this.promotionRepo.find({ where: { active: true } });

    const enhanced = await Promise.all(
      promotions.map((p) => this.attachPromotionDiscount(p, userId))
    );

    return enhanced;
  }

  private async attachPackageDiscount(pkg: AnnouncementPackage, userId: string) {
    const discount = pkg.packageType
      ? await this.findBestDiscountForPackage(userId, pkg.packageType)
      : null;

    return this.formatWithDiscount(pkg, discount);
  }

  private async attachPromotionDiscount(promo: PromotionPackage, userId: string) {
    const discount = promo.promotionType
      ? await this.findBestDiscountForPromotion(userId, promo.promotionType)
      : null;

    return this.formatWithDiscount(promo, discount);
  }

  private formatWithDiscount<T extends { price: number }>(
    pkg: T,
    discount: Discount | null
  ): T & {
    originalPrice: number;
    discountedPrice: number;
    discountCode?: string;
    discountValidTo?: Date;
  } {
    const originalPrice = pkg.price;
    const discountedPrice = discount
      ? this.calculateDiscount(originalPrice, discount)
      : originalPrice;

    return {
      ...pkg,
      originalPrice,
      discountedPrice,
      discountCode: discount?.code,
      discountValidTo: discount?.validTo,
    };
  }

  private calculateDiscount(price: number, discount: Discount): number {
    if (discount.percentage) return Math.max(0, price - (price * discount.percentage) / 100);
    if (discount.fixedAmount) return Math.max(0, price - discount.fixedAmount);
    return price;
  }

  private async findBestDiscountForPackage(
    userId: string,
    packageType: PaymentPackageType
  ): Promise<Discount | null> {
    const now = new Date();
  
    return await this.discountRepo
      .createQueryBuilder('discount')
      .where(':now BETWEEN discount.validFrom AND discount.validTo', { now })
      .andWhere('discount.active = true')
      .andWhere(':type = ANY(discount.applicablePackageTypes)', { type: [packageType] })
      .andWhere('(:userId = ANY(discount.allowedUserIds) OR discount.allowedUserIds IS NULL)', { userId })
      .orderBy('discount.createdAt', 'DESC')
      .getOne();
  }

  private async findBestDiscountForPromotion(
    userId: string,
    promotionType: PromotionPackageType
  ): Promise<Discount | null> {
    const now = new Date();
  
    return await this.discountRepo
      .createQueryBuilder('discount')
      .where(':now BETWEEN discount.validFrom AND discount.validTo', { now })
      .andWhere('discount.active = true')
      .andWhere(':type = ANY(discount.applicablePromotionTypes)', { type: [promotionType] })
      .andWhere('(:userId = ANY(discount.allowedUserIds) OR discount.allowedUserIds IS NULL)', { userId })
      .orderBy('discount.createdAt', 'DESC')
      .getOne();
  }
}