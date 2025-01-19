import {
    Controller,
    Post,
    UploadedFile,
    UseInterceptors,
    Param,
  } from '@nestjs/common';
  import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/public/cloudinary.service';
import { multerOptions } from 'src/public/cloudinary/multer.config';
  
  @Controller('uploads')
  export class UploadController {
    constructor(private readonly cloudinaryService: CloudinaryService) {}
  
    @Post(':userId')
    @UseInterceptors(FileInterceptor('file')) // The key must be 'file'
    async uploadFile(
      @Param('userId') userId: string,
      @UploadedFile() file: Express.Multer.File,
    ) {
      if (!file) {
        throw new Error('Empty file'); // Handle empty file error
      }
      const folder = `users/${userId}`;
      const result = await this.cloudinaryService.uploadFile(file, folder);
      return {
        url: result.secure_url,
        public_id: result.public_id,
      };
    }

    // @Post(':userId')
    // @UseInterceptors(FileInterceptor('file')) // Use 'file' as the key
    // async testUpload(@UploadedFile() file: Express.Multer.File) {
    //   if (!file) {
    //     throw new Error('Empty file'); // Handle empty file error
    //   }
    //   return {
    //     originalname: file.originalname,
    //     mimetype: file.mimetype,
    //     size: file.size,
    //   };
    // }
  }  