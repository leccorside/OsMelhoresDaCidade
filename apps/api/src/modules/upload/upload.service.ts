import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import * as sharpModule from 'sharp';

const sharp: typeof import('sharp') = (sharpModule as any).default || sharpModule;

export interface UploadedImageResult {
  url: string;
  filename: string;
  originalName: string;
  size: number;
  width?: number;
  height?: number;
  mimeType: string;
}

@Injectable()
export class UploadService {
  private readonly baseUploadDir: string;

  constructor() {
    this.baseUploadDir = path.join(process.cwd(), 'uploads');
    this.ensureDirectoryExists(this.baseUploadDir);
  }

  private ensureDirectoryExists(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  async processAndSaveImage(
    file: Express.Multer.File,
    subfolder = 'places',
  ): Promise<UploadedImageResult> {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado.');
    }

    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Formato inválido (${file.mimetype}). Formatos permitidos: JPG, PNG, WebP, AVIF e GIF.`,
      );
    }

    const targetDir = path.join(this.baseUploadDir, subfolder);
    this.ensureDirectoryExists(targetDir);

    const filename = `${randomUUID()}.webp`;
    const targetFilePath = path.join(targetDir, filename);

    try {
      // Otimização via Sharp: redimensionamento proporcional inteligente e conversão para WebP de alta fidelidade
      const imageInstance = sharp(file.buffer);
      const metadata = await imageInstance.metadata();

      await imageInstance
        .resize({
          width: 1920,
          height: 1440,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 85, effort: 4 })
        .toFile(targetFilePath);

      const stats = fs.statSync(targetFilePath);

      return {
        url: `/uploads/${subfolder}/${filename}`,
        filename,
        originalName: file.originalname,
        size: stats.size,
        width: metadata.width,
        height: metadata.height,
        mimeType: 'image/webp',
      };
    } catch (err: any) {
      throw new BadRequestException(`Erro ao processar imagem com Sharp: ${err.message}`);
    }
  }

  async processMultipleImages(
    files: Express.Multer.File[],
    subfolder = 'places',
  ): Promise<UploadedImageResult[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('Nenhum arquivo enviado.');
    }

    return Promise.all(files.map((file) => this.processAndSaveImage(file, subfolder)));
  }
}
