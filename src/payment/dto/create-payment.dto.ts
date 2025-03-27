import { IsNumber, IsOptional, IsString, IsUUID } from "class-validator";

export class CreatePaymentDto {
    @IsUUID()
    orderId: string;

    @IsUUID()
    packageId: string;

    @IsOptional()
    @IsUUID()
    promotionId?: string;

    @IsNumber()
    amount: number;

    @IsNumber()
    originalAmount: number;

    @IsString()
    currency: string;

    @IsOptional()
    @IsString()
    discountCode?: string;

    @IsOptional()
    @IsString()
    promotionDiscountCode?: string;
}