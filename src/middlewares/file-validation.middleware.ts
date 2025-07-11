import { Request, Response, NextFunction } from 'express';

// Magic numbers para validação de assinatura de arquivos
const FILE_SIGNATURES = {
  'image/jpeg': [
    [0xff, 0xd8, 0xff] // JPEG
  ],
  'image/png': [
    [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] // PNG
  ],
  'image/webp': [
    [0x52, 0x49, 0x46, 0x46] // WEBP (RIFF header)
  ]
} as const;

/**
 * Valida a assinatura do arquivo verificando os magic numbers
 */
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

/**
 * Sanitiza o nome do arquivo removendo caracteres perigosos
 */
export function sanitizeFileName(fileName: string): string {
  // Remove caracteres perigosos e mantém apenas letras, números, pontos e hífens
  const sanitized = fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Substitui caracteres especiais por underscore
    .replace(/\.{2,}/g, '.') // Remove múltiplos pontos consecutivos
    .replace(/^\.+|\.+$/g, '') // Remove pontos no início e fim
    .toLowerCase();

  // Garante que o arquivo tenha um nome válido
  if (!sanitized || sanitized.length === 0) {
    return `file_${Date.now()}`;
  }

  // Limita o tamanho do nome
  return sanitized.slice(0, 100);
}

/**
 * Middleware para validação avançada de arquivos
 */
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
    // Validar assinatura do arquivo
    if (!validateFileSignature(file.buffer, file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Arquivo corrompido ou tipo de arquivo inválido'
      });
    }

    // Sanitizar nome do arquivo
    file.originalname = sanitizeFileName(file.originalname);

    // Validações adicionais de segurança
    if (file.size === 0) {
      return res.status(400).json({
        success: false,
        message: 'Arquivo vazio não é permitido'
      });
    }

    // Verificar se o arquivo não é apenas metadados
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

/**
 * Valida se a extensão do arquivo é segura
 */
export function validateFileExtension(fileName: string): boolean {
  const extension = fileName.toLowerCase().split('.').pop();

  if (!extension) {
    return false;
  }

  return !DANGEROUS_EXTENSIONS.includes(`.${extension}`);
}
