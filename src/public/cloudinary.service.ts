import { UploadApiErrorResponse, UploadApiResponse, v2 as cloudinary } from 'cloudinary';

import { Injectable } from '@nestjs/common';

@Injectable()
export class CloudinaryService {
  async uploadFile(
    file: Express.Multer.File,
    folder: string,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      // Use the configured Cloudinary instance
      cloudinary.uploader.upload_stream(
        {
          folder, // Upload to the specified folder
          resource_type: 'auto', // Auto-detect the file type
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      ).end(file.buffer); // Send the file buffer to Cloudinary
    });
  }
}