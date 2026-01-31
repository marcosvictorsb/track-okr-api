import { NextFunction, Request, Response } from 'express';

const FILE_SIGNATURES = {
  'image/jpeg': [[0xff, 0xd8, 0xff]],
  'image/png': [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]]
} as const;

export function validateFileSignature(
  buffer: Buffer,
  mimeType: string
): boolean {
  const signatures = FILE_SIGNATURES[mimeType as keyof typeof FILE_SIGNATURES];

  if (!signatures) {
    return false;
  }

  return signatures.some((signature) => {
    if (buffer.length < signature.length) {
      return false;
    }

    return signature.every((byte, index) => buffer[index] === byte);
  });
}

export function sanitizeFileName(fileName: string): string {
  const sanitized = fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .replace(/^\.+|\.+$/g, '')
    .toLowerCase();

  if (!sanitized || sanitized.length === 0) {
    return `file_${Date.now()}`;
  }

  return sanitized.slice(0, 100);
}

export const advancedFileValidation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const file = (req as Request & { file?: Express.Multer.File }).file;

  if (!file) {
    return next();
  }

  try {
    if (!validateFileSignature(file.buffer, file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Arquivo corrompido ou tipo de arquivo inválido'
      });
    }

    file.originalname = sanitizeFileName(file.originalname);

    if (file.size === 0) {
      return res.status(400).json({
        success: false,
        message: 'Arquivo vazio não é permitido'
      });
    }

    if (file.buffer.length < 100) {
      return res.status(400).json({
        success: false,
        message: 'Arquivo muito pequeno ou inválido'
      });
    }

    next();
  } catch {
    return res.status(400).json({
      success: false,
      message: 'Erro ao validar arquivo'
    });
  }
};

/**
 * Lista de extensões de arquivo perigosas
 */
const DANGEROUS_EXTENSIONS = [
  '.exe',
  '.bat',
  '.cmd',
  '.com',
  '.pif',
  '.scr',
  '.vbs',
  '.js',
  '.jar',
  '.php',
  '.asp',
  '.aspx',
  '.jsp',
  '.sh',
  '.py',
  '.rb',
  '.pl'
];

export function validateFileExtension(fileName: string): boolean {
  const extension = fileName.toLowerCase().split('.').pop();

  if (!extension) {
    return false;
  }

  return !DANGEROUS_EXTENSIONS.includes(`.${extension}`);
}
