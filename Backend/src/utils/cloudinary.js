const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary only if the credentials exist in the environment
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
} else {
  console.warn('WARNING: Cloudinary credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are not set. File uploads will fall back to local relative paths.');
}

/**
 * Uploads a local file to Cloudinary and deletes the local temporary file.
 * If credentials are not configured, it returns a local relative path as fallback.
 * 
 * @param {string} filePath - Absolute path to the local file
 * @param {string} folder - Destination folder on Cloudinary
 * @returns {Promise<string>} The uploaded file's URL
 */
const uploadToCloudinary = async (filePath, folder = 'unishowcase') => {
  try {
    if (!filePath) return '';

    // Check if the file exists locally
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found at path: ${filePath}`);
    }

    // Fallback if Cloudinary is not configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      const filename = path.basename(filePath);
      return `/uploads/${filename}`;
    }

    // Upload file to Cloudinary
    const response = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'auto'
    });

    // Delete local file after upload
    fs.unlink(filePath, (err) => {
      if (err) console.error(`Error deleting local temp file ${filePath}:`, err.message);
    });

    return response.secure_url;
  } catch (error) {
    console.error('Error uploading file to Cloudinary:', error.message);
    
    // Clean up local temp file even if Cloudinary fails to avoid cluttering disk
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) console.error(`Error deleting local temp file ${filePath} on failure:`, err.message);
      });
    }
    throw error;
  }
};

module.exports = { uploadToCloudinary };
