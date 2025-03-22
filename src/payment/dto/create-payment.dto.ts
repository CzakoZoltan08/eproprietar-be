import { IsNumber, IsOptional, IsString, IsUUID } from "class-validator";

export class CreatePaymentDto {
    @IsUUID()
    orderId: string;
  
    @IsNumber()
    amount: number;
  
    @IsString()
    currency: string;
  
    @IsUUID()
    packageId: string;
  
    @IsOptional()
    @IsString()
    discountCode?: string;
  
    @IsOptional()
    @IsNumber()
    originalAmount?: number;
}