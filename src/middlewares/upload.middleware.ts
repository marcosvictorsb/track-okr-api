import { Request, Response, NextFunction } from 'express';

// Middleware simples para validar tamanho do body (temporário)
export const validateFileUpload = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Por enquanto, vamos apenas validar se o content-length não excede 5MB
  const contentLength = parseInt(req.headers['content-length'] || '0');
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (contentLength > maxSize) {
    return res.status(400).json({
      success: false,
      message: 'Arquivo muito grande. Tamanho máximo: 5MB'
    });
  }

  next();
};

// Middleware para tratar erros de upload
export const handleUploadErrors = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
