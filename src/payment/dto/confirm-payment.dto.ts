import { IsNumber, IsOptional, IsString, IsUUID } from "class-validator";

export class ConfirmPaymentDto {
    @IsUUID()
    announcementId: string;
  
    @IsUUID()
    packageId: string;
  
    @IsNumber()
    amount: number;
  
    @IsString()
    currency: string;
  
    @IsOptional()
    @IsString()
    discountCode?: string;
  
    @IsOptional()
    @IsNumber()
    originalAmount?: number;
}