import {
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

import { DeepPartial } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export class CreateAnnouncementDto {
  @IsString()
  announcementType: string;

  @IsString()
  providerType: string;

  @IsString()
  @IsOptional()
  transactionType: string;

  @IsString()
  title: string;

  @IsString()
  city: string;

  @IsString()
  county: string;

  @IsString()
  @IsOptional()
  street: string;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsNumber()
  rooms: number;

  @IsNumber()
  surface: number;

  @IsNumber()
  @IsOptional()
  landSurface: number;

  @IsString()
  @IsOptional()
  currency: string;

  @IsString()
  @IsOptional()
  schema: string;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  apartmentTypeOther: string;

  @IsString()
  @IsOptional()
  partitioning: string;

  @IsNumber()
  @IsOptional()
  number: number;

  @IsNumber()
  @IsOptional()
  floor: number;

  @IsBoolean()
  @IsOptional()
  isNew: boolean;

  @IsObject()
  user: DeepPartial<User>;

  @IsString()
  @IsOptional()
  status: string;

  @IsString()
  @IsOptional()
  comfortLevel: string;

  @IsString()
  @IsOptional()
  apartamentPartitioning: string;

  @IsOptional()
  @IsBoolean()
  deleted: boolean;

  @IsString()
  @IsOptional()
  balcony: string;

  @IsString()
  @IsOptional()
  parking: string;

  @IsNumber()
  @IsOptional()
  numberOfKitchens: number;

  @IsNumber()
  @IsOptional()
  baths: number;

  @IsString()
  @IsOptional()
  stage: string;

  @IsString()
  @IsOptional()
  endDate: string;

  @IsString()
  @IsOptional()
  imageUrl: string;

  @IsString()
  @IsOptional()
  logoUrl: string;

  @IsString()
  @IsOptional()
  phoneContact: string;

  @IsString()
  @IsOptional()
  sketchUrl: string;

  @IsBoolean()
  @IsOptional()
  deleteMedia: boolean = false;

  @IsBoolean()
  @IsOptional()
  streetFront: boolean;

  @IsOptional()
  @IsString({ each: true })
  heightRegime: string[];

  // ✅ NEW FOR TEREN

  @IsNumber()
  @IsOptional()
  streetFrontLength: number; // ml

  @IsString()
  @IsOptional()
  landType: string; // Constructii, Agricol, etc.

  @IsString()
  @IsOptional()
  landPlacement: string; // Intravilan, Extravilan

  @IsOptional()
  @IsString({ each: true })
  urbanismDocuments: string[];

  @IsOptional()
  @IsObject()
  utilities: {
    curent: boolean | null;
    apa: boolean | null;
    canalizare: boolean | null;
    gaz: boolean | null;
  };

  @IsString()
  @IsOptional()
  commercialSpaceType: string;

  @IsNumber()
  @IsOptional()
  usableSurface: number;

  @IsNumber()
  @IsOptional()
  builtSurface: number;

  @IsNumber()
  @IsOptional()
  spaceHeight: number;

  @IsBoolean()
  @IsOptional()
  hasStreetWindow: boolean;

  @IsNumber()
  @IsOptional()
  streetWindowLength: number;

  @IsBoolean()
  @IsOptional()
  hasStreetEntrance: boolean;

  @IsBoolean()
  @IsOptional()
  hasLift: boolean;

  @IsOptional()
  @IsString({ each: true })
  vehicleAccess: string[];
}