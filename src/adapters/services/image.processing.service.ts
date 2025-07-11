import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface ImageProcessingOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export class ImageProcessingService {
  private readonly uploadsDir: string;

  constructor() {
    this.uploadsDir = path.join(process.cwd(), 'uploads', 'avatars');
  }

  async ensureDirectoryExists(): Promise<void> {
    try {
      await fs.access(this.uploadsDir);
    } catch {
      await fs.mkdir(this.uploadsDir, { recursive: true });
    }
  }

  async processAndSaveAvatar(
    fileBuffer: Buffer,
    originalName: string,
    userId: number
  ): Promise<string> {
    await this.ensureDirectoryExists();

    const fileExtension = path.extname(originalName).toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

    if (!allowedExtensions.includes(fileExtension)) {
      throw new Error(
        'Formato de arquivo não suportado. Use JPG, PNG ou WebP.'
      );
    }

    // Verificar se é uma imagem válida
    if (!this.isValidImageBuffer(fileBuffer)) {
      throw new Error('Arquivo não é uma imagem válida.');
    }

    // Gerar nome único para o arquivo
    const uniqueId = uuidv4();
    const fileName = `avatar_${userId}_${uniqueId}${fileExtension}`;
    const filePath = path.join(this.uploadsDir, fileName);

    try {
      // Salvar o arquivo (por enquanto sem processamento)
      // TODO: Implementar redimensionamento com Sharp quando disponível
      await fs.writeFile(filePath, fileBuffer);

      // Retornar o caminho relativo
      return `/uploads/avatars/${fileName}`;
    } catch (error) {
      throw new Error(
        `Erro ao salvar imagem: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  async deleteAvatar(avatarPath: string): Promise<void> {
    try {
      const fullPath = path.join(process.cwd(), avatarPath);
      await fs.unlink(fullPath);
    } catch (error) {
      // Log do erro, mas não falha a operação
      console.warn(`Não foi possível deletar avatar: ${avatarPath}`, error);
    }
  }

  isValidImageBuffer(buffer: Buffer): boolean {
    // Verificar assinaturas de arquivo comuns
    const jpegSignature = [0xff, 0xd8, 0xff];
    const pngSignature = [0x89, 0x50, 0x4e, 0x47];
    const webpSignature = [0x52, 0x49, 0x46, 0x46];

    const bufferStart = Array.from(buffer.slice(0, 4));

    return (
      jpegSignature.every((byte, index) => bufferStart[index] === byte) ||
      pngSignature.every((byte, index) => bufferStart[index] === byte) ||
      (bufferStart[0] === webpSignature[0] &&
        bufferStart[1] === webpSignature[1] &&
        bufferStart[2] === webpSignature[2] &&
        bufferStart[3] === webpSignature[3])
    );
  }
}
