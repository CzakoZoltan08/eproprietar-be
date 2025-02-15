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
      resource_type: resourceType,
      transformation: [
        {
          quality: 'auto', // Automatically adjust quality
          fetch_format: 'auto', // Automatically select the best format (e.g., WebP for images)
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
          resource_type: 'video', // Ensure videos are treated correctly
          format: 'mp4', // Convert all videos to MP4
          transformation: [
            {
              width: 1280,
              height: 720,
              crop: "limit", // Ensure it doesn't upscale
              quality: "auto", // Optimize quality dynamically
              fetch_format: "auto", // Convert to best format
            },
            {
              duration: 120, // Limit video length to 120 seconds
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
}