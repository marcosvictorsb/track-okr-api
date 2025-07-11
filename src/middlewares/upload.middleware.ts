import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

// Configuração do Multer para armazenar arquivo em memória
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    // Validar tipos de arquivo aceitos
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp'
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Formato de arquivo não suportado. Use JPG, PNG ou WebP'));
    }
  }
});

// Middleware para upload de arquivo único
export const validateFileUpload = upload.single('file');

// Middleware para tratar erros de upload
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
