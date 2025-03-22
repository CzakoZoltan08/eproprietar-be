import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnnouncementPackage } from '../entities/announcement-package.entity';
import { Discount } from '../entities/discount.entity';
import { PaymentPackageType, PromotionPackageType } from '../enums/announcement-payment.enums';

@Injectable()
export class PricingService {
  constructor(
    @InjectRepository(AnnouncementPackage)
    private readonly packageRepo: Repository<AnnouncementPackage>,
    @InjectRepository(Discount)
    private readonly discountRepo: Repository<Discount>,
  ) {}

  async getPricingOptions(userId: string) {
    const allPackages = await this.packageRepo.find({ where: { active: true } });

    const [packages, promotions] = allPackages.reduce<[any[], any[]]>(([pkgs, promos], pkg) => {
      if (pkg.packageType) pkgs.push(pkg);
      else if (pkg.promotionType) promos.push(pkg);
      return [pkgs, promos];
    }, [[], []]);

    return {
      packages: await Promise.all(
        packages.map(async (p) => this.attachDiscount(p, userId)),
      ),
      promotions: await Promise.all(
        promotions.map(async (p) => this.attachDiscount(p, userId)),
      ),
    };
  }

  private async attachDiscount(pkg: AnnouncementPackage, userId: string) {
    const discount = pkg.packageType
      ? await this.findBestDiscountForPackage(userId, pkg.packageType)
      : await this.findBestDiscountForPromotion(userId, pkg.promotionType);

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

  private async findBestDiscountForPackage(userId: string, packageType: PaymentPackageType): Promise<Discount | null> {
    const now = new Date();
  
    return await this.discountRepo
      .createQueryBuilder('discount')
      .where(':now BETWEEN discount.validFrom AND discount.validTo', { now })
      .andWhere('discount.active = true')
      .andWhere(':type = ANY(discount.applicablePackageTypes)', { type: packageType })
      .orderBy('discount.createdAt', 'DESC')
      .getOne();
  }

  private async findBestDiscountForPromotion(userId: string, promotionType: PromotionPackageType): Promise<Discount | null> {
    const now = new Date();
  
    return await this.discountRepo
      .createQueryBuilder('discount')
      .where(':now BETWEEN discount.validFrom AND discount.validTo', { now })
      .andWhere('discount.active = true')
      .andWhere(':type = ANY(discount.applicablePromotionTypes)', { type: promotionType })
      .orderBy('discount.createdAt', 'DESC')
      .getOne();
  }
}