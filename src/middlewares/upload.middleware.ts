import { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { validateFileExtension } from './file-validation.middleware';

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
    fields: 10
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp'
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(
        new Error('Formato de arquivo não suportado. Use JPG, PNG ou WebP')
      );
    }

    if (!validateFileExtension(file.originalname)) {
      return cb(new Error('Extensão de arquivo não permitida'));
    }

    cb(null, true);
  }
});

export const validateFileUpload = upload.single('file');

export const handleUploadErrors = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Arquivo muito grande. Tamanho máximo: 5MB'
      });
    }

    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Campo de arquivo não esperado'
      });
    }
  }

  if (error.message.includes('Formato de arquivo')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  if (error.message.includes('muito grande')) {
    return res.status(400).json({
      success: false,
      message: 'Arquivo muito grande. Tamanho máximo: 5MB'
    });
  }

  next(error);
};
