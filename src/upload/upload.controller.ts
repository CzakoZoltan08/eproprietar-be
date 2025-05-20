import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Param,
  Body,
  Get,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CloudinaryService } from 'src/public/cloudinary.service';

@Controller('uploads')
export class UploadController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Get(":userId/:announcementId")
  async getOptimizedResources(
  @Param("userId") userId: string,
  @Param("announcementId") announcementId: string
  ) {
    const folder = `users/${userId}/announcements/${announcementId}`;

    // Fetch images and videos separately
    const [imageResources, videoResources] = await Promise.all([
      this.cloudinaryService.getResourcesByFolder(folder, "image"),
      this.cloudinaryService.getResourcesByFolder(folder, "video"),
    ]);

    // Merge both resources
    const allResources = [...imageResources, ...videoResources];

    // Map and apply optimization
    const optimizedResources = allResources.map((resource) => ({
      original_url: resource.secure_url, // Original URL (unoptimized)
      optimized_url: this.cloudinaryService.getOptimizedUrl(
        resource.public_id,
        resource.resource_type as "image" | "video"
      ),
      type: resource.resource_type, // "image" or "video"
      format: resource.format, // File format
      public_id: resource.public_id, // Cloudinary public ID
    }));

    return {
      message: "Optimized resources fetched successfully",
      resources: optimizedResources,
    };
  }

  @UseGuards(JwtAuthGuard)
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

    if (file.size > 100 * 1024 * 1024) { // Check file size (100MB limit)
      return reject(new Error("File size exceeds 100MB limit"));
    }

    const folder = `users/${userId}/announcements/${announcementId}/${type}s`;

    let result: UploadApiResponse | UploadApiErrorResponse;
    if(type == 'video'){
      result = await this.cloudinaryService.uploadVideoFile(file, folder);
    }
    else{
      result = await this.cloudinaryService.uploadImageFile(file, folder);
    }

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

function reject(arg0: Error) {
  throw new Error('Function not implemented.');
}
