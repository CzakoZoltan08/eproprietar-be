import { UploadApiErrorResponse, UploadApiResponse, v2 as cloudinary } from 'cloudinary';

import { Injectable } from '@nestjs/common';

@Injectable()
export class CloudinaryService {
  async getResourcesByFolder(folder: string, resourceType: 'image' | 'video' = 'image'): Promise<any> {
    return new Promise((resolve, reject) => {
      cloudinary.api.resources(
        {
          type: 'upload',
          prefix: folder,
          resource_type: resourceType, // Ensure we fetch videos when needed
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result.resources);
        },
      );
    });
  }

  getOptimizedUrl(publicId: string, resourceType: 'image' | 'video'): string {
    return cloudinary.url(publicId, {
      secure: true, // 🔐 Force HTTPS
      resource_type: resourceType,
      transformation: [
        {
          quality: 'auto',
          fetch_format: 'auto',
        },
      ],
    });
  }

  async uploadImageFile(
    file: Express.Multer.File,
    folder: string,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      if (file.size > 5 * 1024 * 1024) { // Limit 5MB per image
        return reject(new Error("Image size exceeds 5MB limit."));
      }
  
      cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
          format: "jpg", // Convert all images to JPG for better compression
          transformation: [
            {
              width: 1920,
              height: 1080,
              crop: "limit", // Prevents upscaling
              quality: "auto", // Auto adjusts quality to reduce file size
              fetch_format: "auto", // Converts to WebP, JPEG, or PNG dynamically
            },
          ],
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      ).end(file.buffer);// Send the file buffer for upload
    });
  }

  async uploadVideoFile(
  file: Express.Multer.File,
  folder: string,
    ): Promise<UploadApiResponse | UploadApiErrorResponse> {
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'video',
            // ⚠️ Avoid forcing format here if preset does the same
            eager: [
              {
                width: 1280,
                height: 720,
                crop: 'limit',
                quality: 'auto',
                fetch_format: 'auto',
              },
            ],
            eager_async: true,
            // ❌ Don't apply any incoming transformation (especially if a preset exists)
            // upload_preset: 'your_unsigned_preset_without_transformations', // Optional, only if needed
          },
          async (error, result) => {
            if (error) return reject(error);

            try {
              const processed = await this.pollUntilVideoProcessed(result.public_id);
              resolve(processed);
            } catch (pollError) {
              reject(pollError);
            }
          },
        ).end(file.buffer);
      });
    }

  async deleteResources(publicIds: string[], resourceType: 'image' | 'video' = 'image'): Promise<void> {
    return new Promise((resolve, reject) => {
      cloudinary.api.delete_resources(
        publicIds,
        { resource_type: resourceType }, // Specify resource type explicitly
        (error, result) => {
          if (error) return reject(error);
          resolve();
        },
      );
    });
  }

  async deleteFolderIfEmpty(folder: string): Promise<void> {
    return new Promise((resolve, reject) => {
      cloudinary.api.delete_folder(folder, (error, result) => {
        if (error && error.http_code !== 404) { // Ignore 404 errors (folder not found)
          console.error(`Error deleting folder ${folder}:`, error);
          return reject(error);
        }
        console.log(`Deleted empty folder: ${folder}`);
        resolve();
      });
    });
  }

  async pollUntilVideoProcessed(
  publicId: string,
  resourceType: 'video' = 'video',
  intervalMs: number = 5000,
  timeoutMs: number = 1200000,
  ): Promise<any> {
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      const check = async () => {
        try {
          const result = await cloudinary.api.resource(publicId, {
            resource_type: resourceType,
            type: 'upload',
          });

          // If the derived asset (eager transformation) is ready
          if (result.derived && result.derived.length > 0) {
            return resolve(result);
          }

          // Timeout
          if (Date.now() - startTime > timeoutMs) {
            return reject(new Error('Video transformation timed out.'));
          }

          setTimeout(check, intervalMs);
        } catch (error) {
          return reject(error);
        }
      };

      check();
    });
  }

  /**
   * Uploads a flyer (image or PDF).
   * - images: resource_type=image (transform as image)
   * - pdf:    resource_type=raw   (store original), plus preview image URL exposed by helper
   */
  async uploadFlyerFile(
    file: Express.Multer.File,
    folder: string,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    const isPdf = (file.mimetype || '').toLowerCase().includes('pdf');
    const isImage = (file.mimetype || '').toLowerCase().startsWith('image/');

    if (!isPdf && !isImage) {
      throw new Error('Flyer must be an image or a PDF.');
    }

    // Size limits (tune as you like):
    if (isImage && file.size > 10 * 1024 * 1024) {
      throw new Error('Image flyer size exceeds 10MB limit.');
    }
    if (isPdf && file.size > 50 * 1024 * 1024) {
      throw new Error('PDF flyer size exceeds 50MB limit.');
    }

    return new Promise((resolve, reject) => {
      if (isImage) {
        // Upload as image with safe transforms (similar to your image uploader)
        cloudinary.uploader
          .upload_stream(
            {
              folder,
              resource_type: 'image',
              // keep original format to preserve possible transparency; or force jpg if you prefer
              transformation: [
                {
                  width: 1920,
                  height: 1080,
                  crop: 'limit',
                  quality: 'auto',
                  fetch_format: 'auto',
                },
              ],
            },
            (error, result) => (error ? reject(error) : resolve(result)),
          )
          .end(file.buffer);
      } else {
        // PDF → store as raw (original file). We'll generate preview via image delivery.
        cloudinary.uploader
          .upload_stream(
            {
              folder,
              resource_type: 'raw',
            },
            (error, result) => (error ? reject(error) : resolve(result)),
          )
          .end(file.buffer);
      }
    });
  }

  /**
   * For a stored PDF (resource_type=raw), build a preview JPG URL for page 1.
   * We ask Cloudinary to render the PDF as an image (resource_type=image).
   */
  getPdfPreviewUrl(publicId: string): string {
    return cloudinary.url(publicId, {
      secure: true,
      resource_type: 'image', // render as image
      page: 1,
      format: 'jpg',
      transformation: [
        { width: 1920, height: 1080, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
      ],
    });
  }

  /**
   * Get flyer resource(s) for an announcement:
   * - an image flyer (resource_type=image) under /flyer
   * - or a raw PDF (resource_type=raw) under /flyer
   * Return at most one latest flyer, or list if you prefer.
   */
  async getFlyerResource(folder: string): Promise<
    | {
        public_id: string;
        secure_url: string;
        resource_type: 'image' | 'raw';
        format?: string;
        mime_type?: string;
        preview_url?: string; // for pdf
      }
    | null
  > {
    const imageFolder = `${folder}/flyer`;
    // Try image first
    const imageRes: any[] = await this.getResourcesByFolder(imageFolder, 'image').catch(() => []);
    if (imageRes?.length) {
      // pick the latest
      const r = imageRes[0];
      return {
        public_id: r.public_id,
        secure_url: this.getOptimizedUrl(r.public_id, 'image'),
        resource_type: 'image',
        format: r.format,
        mime_type: r.mime_type,
      };
    }

    // Then raw (pdf)
    const rawRes: any[] = await new Promise<any[]>((resolve, reject) => {
      cloudinary.api.resources(
        {
          type: 'upload',
          prefix: imageFolder,
          resource_type: 'raw',
        },
        (error, result) => (error ? reject(error) : resolve(result.resources as any[])),
      );
    }).catch(() => [] as any[]);

    if (rawRes?.length) {
      const r = rawRes[0];
      return {
        public_id: r.public_id,
        secure_url: r.secure_url, // original raw url
        resource_type: 'raw',
        format: r.format,
        mime_type: r.mime_type,
        preview_url: this.getPdfPreviewUrl(r.public_id),
      };
    }

    return null;
  }
}