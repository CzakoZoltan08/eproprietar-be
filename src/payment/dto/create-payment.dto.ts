import { IsBoolean, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, ValidateIf, ValidateNested } from 'class-validator';

import { Type } from 'class-transformer';

class InvoiceDetailsDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  cif?: string;

  @IsOptional()
  @IsString()
  regCom?: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsEmail()
  email: string;

  @IsBoolean()
  isTaxPayer: boolean;
}

class ProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  quantity: number;

  @IsString()
  @IsNotEmpty()
  unitOfMeasure: string;

  @IsNumber()
  unitPrice: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsBoolean()
  isTaxIncluded: boolean;

  @IsNumber()
  vatPercent: number;
}

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

  @ValidateIf(o => o.amount > 0)
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

  @ValidateIf(o => o.amount > 0)
  @ValidateNested()
  @Type(() => InvoiceDetailsDto)
  invoiceDetails: InvoiceDetailsDto;

  @ValidateNested({ each: true })
  @Type(() => ProductDto)
  @IsOptional()
  products?: ProductDto[];
}