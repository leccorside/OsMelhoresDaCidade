import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
import { UploadService, UploadedImageResult } from './upload.service';

@ApiTags('Uploads')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @ApiOperation({ summary: 'Fazer upload e redimensionamento otimizado de uma única imagem' })
  @ApiConsumes('multipart/form-data')
  @ApiQuery({ name: 'folder', required: false, description: 'Subpasta de destino (ex: places, avatars)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadSingleImage(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder?: string,
  ): Promise<UploadedImageResult> {
    return this.uploadService.processAndSaveImage(file, folder || 'places');
  }

  @Post('images')
  @ApiOperation({ summary: 'Fazer upload e otimização de múltiplas imagens em lote (até 10)' })
  @ApiConsumes('multipart/form-data')
  @ApiQuery({ name: 'folder', required: false, description: 'Subpasta de destino (ex: places)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadMultipleImages(
    @UploadedFiles() files: Express.Multer.File[],
    @Query('folder') folder?: string,
  ): Promise<UploadedImageResult[]> {
    return this.uploadService.processMultipleImages(files, folder || 'places');
  }
}
