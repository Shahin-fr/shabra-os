import { v2 as cloudinary } from 'cloudinary';


// Configure Cloudinary
// Parse CLOUDINARY_URL if available, otherwise use individual environment variables
let cloudinaryConfig: any = {
  secure: true,
};

if (process.env.CLOUDINARY_URL) {
  // Parse the CLOUDINARY_URL format: cloudinary://api_key:api_secret@cloud_name
  const url = new URL(process.env.CLOUDINARY_URL);
  cloudinaryConfig = {
    cloud_name: url.hostname,
    api_key: url.username,
    api_secret: url.password,
    secure: true,
  };
} else {
  // Use individual environment variables
  cloudinaryConfig = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  };
}

cloudinary.config(cloudinaryConfig);

export { cloudinary };

// Utility function to upload file to Cloudinary
export async function uploadToCloudinary(
  fileBuffer: Buffer,
  folder: string = 'shabra-employee-documents',
  publicId?: string
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: 'auto',
        quality: 'auto',
        fetch_format: 'auto',
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(new Error('Failed to upload file to Cloudinary'));
        } else if (result) {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        } else {
          reject(new Error('No result from Cloudinary upload'));
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
}

// Utility function to delete file from Cloudinary
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, _result) => {
      if (error) {
        console.error('Cloudinary delete error:', error);
        reject(new Error('Failed to delete file from Cloudinary'));
      } else {
        resolve();
      }
    });
  });
}

// Utility function to get file type from Cloudinary resource type
export function getFileTypeFromCloudinary(resourceType: string, format: string): string {
  switch (resourceType) {
    case 'image':
      return 'IMAGE';
    case 'video':
      return 'VIDEO';
    case 'raw':
      return format?.toUpperCase() || 'DOCUMENT';
    default:
      return 'DOCUMENT';
  }
}

// Utility function to get file category based on file type and name
export function getDocumentCategory(fileName: string, _fileType: string): string {
  const name = fileName.toLowerCase();
  
  // Contract-related documents
  if (name.includes('contract') || name.includes('agreement') || name.includes('employment')) {
    return 'CONTRACT';
  }
  
  // Identification documents
  if (name.includes('id') || name.includes('passport') || name.includes('national') || name.includes('identity')) {
    return 'IDENTIFICATION';
  }
  
  // Certificate documents
  if (name.includes('certificate') || name.includes('diploma') || name.includes('degree') || name.includes('license')) {
    return 'CERTIFICATE';
  }
  
  // Performance review documents
  if (name.includes('review') || name.includes('performance') || name.includes('evaluation') || name.includes('appraisal')) {
    return 'PERFORMANCE_REVIEW';
  }
  
  // Medical documents
  if (name.includes('medical') || name.includes('health') || name.includes('insurance')) {
    return 'MEDICAL';
  }
  
  // Payroll documents
  if (name.includes('payroll') || name.includes('salary') || name.includes('wage') || name.includes('payslip')) {
    return 'PAYROLL';
  }
  
  // Default to OTHER
  return 'OTHER';
}
