import { UploadApiErrorResponse, UploadApiResponse, v2 as cloudinary } from 'cloudinary';

import { Injectable } from '@nestjs/common';

@Injectable()
export class CloudinaryService {
  async getResourcesByFolder(folder: string): Promise<any> {
    return new Promise((resolve, reject) => {
      cloudinary.api.resources(
        {
          type: 'upload',
          prefix: folder, // Fetch all resources in this folder
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result.resources); // Return the array of resources
        },
      );
    });
  }

  getOptimizedUrl(publicId: string, resourceType: 'image' | 'video'): string {
    return cloudinary.url(publicId, {
      resource_type: resourceType,
      transformation: [
        {
          quality: 'auto', // Automatically adjust quality
          fetch_format: 'auto', // Automatically select the best format (e.g., WebP for images)
        },
      ],
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder, // Folder path for storing files
          resource_type: 'auto', // Automatically detect type (image/video)
          transformation: [
            {
              quality: 'auto', // Automatically adjust quality
              fetch_format: 'auto', // Automatically set the best format (e.g., WebP for images)
            },
          ],
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      ).end(file.buffer); // Send the file buffer for upload
    });
  }
}