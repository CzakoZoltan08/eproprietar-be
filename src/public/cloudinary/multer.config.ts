import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';

export const multerOptions = (folder: string) => {
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder, // Dynamic folder path
      resource_type: 'auto', // Automatically detect if it's an image or video
    },
  });

  return { storage };
};