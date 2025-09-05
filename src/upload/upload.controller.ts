// upload.controller.ts

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
import { FirebaseAuthGuard } from 'src/auth/firebase-auth.guard';
import { CloudinaryService } from 'src/public/cloudinary.service';

@Controller('uploads')
export class UploadController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Get(':announcementId')
  async getOptimizedResources(@Param('announcementId') announcementId: string) {
    const folder = `announcements/${announcementId}`;

    // Fetch images and videos
    const [imageResources, videoResources] = await Promise.all([
      this.cloudinaryService.getResourcesByFolder(`${folder}/images`, 'image'),
      this.cloudinaryService.getResourcesByFolder(`${folder}/videos`, 'video'),
    ]);

    const allResources = [...imageResources, ...videoResources];

    const optimizedResources = allResources.map((resource) => ({
      original_url: resource.secure_url,
      optimized_url: this.cloudinaryService.getOptimizedUrl(
        resource.public_id,
        resource.resource_type as 'image' | 'video',
      ),
      type: resource.resource_type, // "image" | "video"
      format: resource.format,
      public_id: resource.public_id,
    }));

    // NEW: also fetch flyer (image or pdf/raw)
    const flyer = await this.cloudinaryService.getFlyerResource(folder);

    return {
      message: 'Optimized resources fetched successfully',
      resources: optimizedResources,
      flyer: flyer
        ? {
            url:
              flyer.resource_type === 'image'
                ? flyer.secure_url
                : flyer.secure_url, // raw url for pdf
            preview_url: flyer.preview_url || null, // for pdf
            mimeType: flyer.mime_type || (flyer.format ? `image/${flyer.format}` : undefined),
            resource_type: flyer.resource_type, // 'image' | 'raw'
            public_id: flyer.public_id,
          }
        : null,
    };
  }

  @UseGuards(FirebaseAuthGuard)
  @Post(':announcementId')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Param('announcementId') announcementId: string,
    @Body('type') type: 'image' | 'video' | 'flyer',
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new Error('Empty file');
    }

    if (file.size > 100 * 1024 * 1024) {
      // 100MB absolute max for this endpoint
      throw new Error('File size exceeds 100MB limit');
    }

    const base = `announcements/${announcementId}`;
    let result: UploadApiResponse | UploadApiErrorResponse;

    if (type === 'video') {
      const folder = `${base}/videos`;
      result = await this.cloudinaryService.uploadVideoFile(file, folder);
      return {
        message: 'File uploaded successfully',
        optimized_url: (result as any).secure_url?.replace('/upload/', '/upload/q_auto,f_auto/'),
        public_id: (result as any).public_id,
        mimeType: file.mimetype,
        type: 'video',
      };
    }

    if (type === 'image') {
      const folder = `${base}/images`;
      result = await this.cloudinaryService.uploadImageFile(file, folder);
      return {
        message: 'File uploaded successfully',
        optimized_url: (result as any).secure_url?.replace('/upload/', '/upload/q_auto,f_auto/'),
        public_id: (result as any).public_id,
        mimeType: file.mimetype,
        type: 'image',
      };
    }

    if (type === 'flyer') {
      const folder = `${base}/flyer`;
      result = await this.cloudinaryService.uploadFlyerFile(file, folder);

      const isPdf = (file.mimetype || '').toLowerCase().includes('pdf');
      const resource_type = isPdf ? 'raw' : 'image';

      // For images, we can return an optimized url; for PDFs we return raw url + preview url.
      const url =
        resource_type === 'image'
          ? (result as any).secure_url?.replace('/upload/', '/upload/q_auto,f_auto/')
          : (result as any).secure_url;

      const preview_url =
        resource_type === 'raw'
          ? this.cloudinaryService.getPdfPreviewUrl((result as any).public_id)
          : undefined;

      return {
        message: 'Flyer uploaded successfully',
        url,
        preview_url,
        public_id: (result as any).public_id,
        mimeType: file.mimetype,
        type: 'flyer',
        resource_type,
      };
    }

    throw new Error('Unsupported type');
  }
}