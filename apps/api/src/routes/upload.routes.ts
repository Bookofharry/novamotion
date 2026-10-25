import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

export const uploadRouter = Router();

// Ensure upload directory exists
const uploadDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.png';
    const filename = `ref-${Date.now()}-${uuidv4().substring(0, 8)}${ext}`;
    cb(null, filename);
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = [
    'image/png', 
    'image/jpeg', 
    'image/jpg', 
    'image/webp', 
    'image/gif', 
    'image/bmp', 
    'image/avif', 
    'image/svg+xml'
  ];
  if (allowed.includes(file.mimetype.toLowerCase()) || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type. Please upload an image (PNG, JPG, WEBP, AVIF, GIF).'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

uploadRouter.post('/', (req, res) => {
  upload.single('image')(req, res, (err: any) => {
    if (err) {
      console.error('[UploadRouter] Multer error:', err.message);
      return res.status(400).json({
        success: false,
        error: err.message || 'File upload failed',
      });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image file uploaded' });
    }

    const publicUrl = `/uploads/${req.file.filename}`;
    
    let dataUri: string | undefined;
    try {
      const filePath = path.resolve(uploadDir, req.file.filename);
      const fileBuffer = fs.readFileSync(filePath);
      const base64Data = fileBuffer.toString('base64');
      dataUri = `data:${req.file.mimetype || 'image/png'};base64,${base64Data}`;
    } catch {
      // ignore
    }

    res.json({
      success: true,
      data: {
        url: publicUrl,
        dataUri,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  });
});

