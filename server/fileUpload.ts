import { randomUUID } from "crypto";
import { writeFile, mkdir } from "fs/promises";
import { join, extname } from "path";
import { existsSync } from "fs";
import type { FileType } from "@shared/schema";

export interface UploadedFile {
  originalName: string;
  fileName: string;
  url: string;
  fileType: FileType;
  mimeType: string;
  size: number;
}

// File type mapping based on extensions
const fileTypeMap: Record<string, FileType> = {
  // Documents
  '.pdf': 'document',
  '.doc': 'document',
  '.docx': 'document',
  '.txt': 'document',
  '.md': 'document',
  '.rtf': 'document',
  
  // Code files
  '.js': 'code',
  '.ts': 'code',
  '.jsx': 'code',
  '.tsx': 'code',
  '.py': 'code',
  '.java': 'code',
  '.cpp': 'code',
  '.c': 'code',
  '.h': 'code',
  '.css': 'code',
  '.html': 'code',
  '.php': 'code',
  '.rb': 'code',
  '.go': 'code',
  '.rs': 'code',
  '.swift': 'code',
  '.kt': 'code',
  '.scala': 'code',
  '.sh': 'code',
  '.bat': 'code',
  '.sql': 'code',
  '.json': 'code',
  '.xml': 'code',
  '.yaml': 'code',
  '.yml': 'code',
  
  // Data files
  '.csv': 'data',
  '.xlsx': 'data',
  '.xls': 'data',
  '.tsv': 'data',
  '.parquet': 'data',
  '.avro': 'data',
  
  // Images
  '.jpg': 'image',
  '.jpeg': 'image',
  '.png': 'image',
  '.gif': 'image',
  '.svg': 'image',
  '.webp': 'image',
  '.bmp': 'image',
  '.tiff': 'image',
  '.ico': 'image',
};

export function getFileType(filename: string): FileType {
  const ext = extname(filename).toLowerCase();
  return fileTypeMap[ext] || 'other';
}

export function getMimeType(filename: string): string {
  const ext = extname(filename).toLowerCase();
  
  const mimeMap: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.txt': 'text/plain',
    '.md': 'text/markdown',
    '.js': 'application/javascript',
    '.ts': 'application/typescript',
    '.json': 'application/json',
    '.xml': 'application/xml',
    '.csv': 'text/csv',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
  };
  
  return mimeMap[ext] || 'application/octet-stream';
}

export class FileUploadService {
  private uploadDir: string;
  private baseUrl: string;

  constructor(uploadDir = './uploads', baseUrl = '/uploads') {
    this.uploadDir = uploadDir;
    this.baseUrl = baseUrl;
  }

  async ensureUploadDir(): Promise<void> {
    if (!existsSync(this.uploadDir)) {
      await mkdir(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(
    fileBuffer: Buffer,
    originalName: string,
    mimeType?: string
  ): Promise<UploadedFile> {
    await this.ensureUploadDir();

    const fileId = randomUUID();
    const ext = extname(originalName);
    const fileName = `${fileId}${ext}`;
    const filePath = join(this.uploadDir, fileName);
    
    await writeFile(filePath, fileBuffer);

    const detectedMimeType = mimeType || getMimeType(originalName);
    const fileType = getFileType(originalName);
    
    return {
      originalName,
      fileName,
      url: `${this.baseUrl}/${fileName}`,
      fileType,
      mimeType: detectedMimeType,
      size: fileBuffer.length,
    };
  }

  async uploadFromUrl(url: string, name?: string): Promise<UploadedFile> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch file from URL: ${response.statusText}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      const originalName = name || url.split('/').pop() || 'downloaded-file';
      const mimeType = response.headers.get('content-type') || undefined;

      return this.uploadFile(buffer, originalName, mimeType);
    } catch (error) {
      throw new Error(`Failed to upload from URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const fileUploadService = new FileUploadService();
