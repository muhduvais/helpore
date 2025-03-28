import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { cloudinary } from '../config';

export const uploadToCloudinary = async (
    file: Express.Multer.File,
    folder: string,
    uniqueId: string
): Promise<{ public_id: string; secure_url: string }> => {
    if (!file.buffer) throw new Error('File buffer is empty');

    return new Promise((resolve, reject) => {
        const fileName = `${uniqueId}_${file.originalname.split(' ').join('_').replace(/\.[^/.]+$/, '')}`;
        console.log('filename: ', fileName)

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                public_id: fileName,
                resource_type: 'image',
                transformation: [{ width: 500, height: 500, crop: 'limit' }],
            },
            (error: UploadApiErrorResponse | undefined, result?: UploadApiResponse) => {
                if (error) {
                    return reject(new Error(error.message || 'Image upload failed'));
                }
                if (!result) {
                    return reject(new Error('Image upload failed, no response received'));
                }
                resolve({ public_id: result.public_id, secure_url: result.secure_url });
            }
        );

        uploadStream.end(file.buffer);
    });
};

export const generateSignedUrl = (
    publicId: string,
    options: {
      transformation?: Array<Record<string, string | number | boolean>>;
      resourceType?: string;
      expiresAt?: number;
    } = {}
  ): string => {
    const {
      transformation = [],
      resourceType = 'image',
      expiresAt = Math.floor(Date.now() / 1000) + 3600
    } = options;
  
    return cloudinary.url(publicId, {
      secure: true,
      resource_type: resourceType,
      type: 'upload',
      transformation,
      sign_url: true,
      sign_version: true,
      expires_at: expiresAt
    });
  };