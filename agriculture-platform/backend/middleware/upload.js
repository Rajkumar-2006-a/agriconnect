import multer from 'multer';
import path from 'path';
import cloudinary from '../config/cloudinary.js';

class CloudinaryStorage {
  constructor(options = {}) {
    this.folder = options.folder || 'agriconnect';
  }

  _handleFile(req, file, cb) {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: this.folder,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) {
          return cb(error);
        }
        cb(null, {
          path: result.secure_url,
          filename: result.public_id,
          secure_url: result.secure_url,
          public_id: result.public_id,
          format: result.format,
          bytes: result.bytes,
        });
      }
    );

    file.stream.pipe(uploadStream);
  }

  _removeFile(req, file, cb) {
    if (file.public_id) {
      cloudinary.uploader.destroy(file.public_id, cb);
    } else {
      cb(null);
    }
  }
}

const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

const storage = isCloudinaryConfigured
  ? new CloudinaryStorage({ folder: 'agriconnect' })
  : multer.diskStorage({
      destination: 'uploads/',
      filename: (req, file, cb) =>
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`),
    });

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => cb(null, file.mimetype.startsWith('image/')),
  limits: { fileSize: 10 * 1024 * 1024 },
});

export default upload;
