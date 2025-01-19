import { CloudinaryService } from 'src/public/cloudinary.service';
import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';

@Module({
  controllers: [UploadController],
  providers: [CloudinaryService],
})
export class UploadModule {}