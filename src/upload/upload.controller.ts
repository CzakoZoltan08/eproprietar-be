import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Param,
  Body,
  Get,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/public/cloudinary.service';

@Controller('uploads')
export class UploadController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Get(':userId/:announcementId')
  async getOptimizedResources(
    @Param('userId') userId: string,
    @Param('announcementId') announcementId: string,
  ) {
    const folder = `users/${userId}/announcements/${announcementId}`;
    const resources = await this.cloudinaryService.getResourcesByFolder(folder);

    // Map and apply optimization to each resource
    const optimizedResources = resources.map((resource) => ({
      original_url: resource.secure_url, // Original URL (unoptimized)
      optimized_url: this.cloudinaryService.getOptimizedUrl(
        resource.public_id,
        resource.resource_type as 'image' | 'video',
      ),
      type: resource.resource_type, // image or video
      format: resource.format, // File format
      public_id: resource.public_id, // Cloudinary public ID
    }));

    return {
      message: 'Optimized resources fetched successfully',
      resources: optimizedResources,
    };
  }

  @Post(':userId/:announcementId')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Param('userId') userId: string,
    @Param('announcementId') announcementId: string,
    @Body('type') type: 'image' | 'video',
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new Error('Empty file');
    }

    const folder = `users/${userId}/announcements/${announcementId}/${type}s`;

    // Upload the file with automatic optimization
    const result = await this.cloudinaryService.uploadFile(file, folder);

    return {
      message: 'File uploaded successfully',
      optimized_url: result.secure_url.replace(
        '/upload/',
        '/upload/q_auto,f_auto/',
      ), // Apply transformations to URL
      public_id: result.public_id,
    };
  }
}