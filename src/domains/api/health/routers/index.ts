import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

const router = Router();

// Health check básico
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Teste de uploads
router.get('/test-uploads', (req: Request, res: Response) => {
  const uploadsDir = path.join(process.cwd(), 'uploads');
  const avatarsDir = path.join(uploadsDir, 'avatars');

  try {
    const uploadsExists = fs.existsSync(uploadsDir);
    const avatarsExists = fs.existsSync(avatarsDir);

    let avatarFiles: string[] = [];
    if (avatarsExists) {
      avatarFiles = fs
        .readdirSync(avatarsDir)
        .filter((file) => file.match(/\.(jpg|jpeg|png|webp)$/i));
    }

    res.json({
      status: 'OK',
      uploads: {
        directory_exists: uploadsExists,
        avatars_directory_exists: avatarsExists,
        sample_files: avatarFiles.slice(0, 5), // Primeiros 5 arquivos
        total_files: avatarFiles.length
      },
      cors_headers: {
        origin: req.headers.origin,
        'access-control-allow-origin': res.get('Access-Control-Allow-Origin')
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
