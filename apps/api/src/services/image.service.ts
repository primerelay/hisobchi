import { cloudinary } from '../config/cloudinary';
import { ApiError } from '../middleware';

export interface UploadResult {
  url: string;
  publicId: string;
}

export async function uploadImage(
  buffer: Buffer,
  folder: string = 'menu-items'
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `oshxona/${folder}`,
        transformation: [
          { width: 800, height: 800, crop: 'limit' },
          { quality: 'auto' },
          { format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) {
          reject(new ApiError('Rasm yuklashda xatolik', 500));
        } else if (result) {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        } else {
          reject(new ApiError('Rasm yuklashda xatolik', 500));
        }
      }
    );

    uploadStream.end(buffer);
  });
}

export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting image:', error);
    // Don't throw - image deletion is not critical
  }
}

export function getPublicIdFromUrl(url: string): string | null {
  try {
    const matches = url.match(/\/oshxona\/([^.]+)/);
    return matches ? `oshxona/${matches[1]}` : null;
  } catch {
    return null;
  }
}
