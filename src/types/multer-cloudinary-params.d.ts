declare module 'multer-storage-cloudinary' {
    import { StorageEngine } from 'multer';
    import { ConfigOptions } from 'cloudinary';
  
    export interface MulterCloudinaryStorageOptions {
      cloudinary: any; // Cloudinary instance
      params: {
        folder?: string; // Folder path for uploaded files
        resource_type?: 'image' | 'video' | 'raw' | 'auto';
        format?: string; // Specify the format (e.g., 'jpg', 'png')
        public_id?: string; // Specify the public ID of the uploaded asset
        transformation?: Record<string, unknown>[]; // Cloudinary transformations
      };
    }
  
    export class CloudinaryStorage implements StorageEngine {
      constructor(options: MulterCloudinaryStorageOptions);
    }
  }  