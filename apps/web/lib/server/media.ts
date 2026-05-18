import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { resolveWorkspacePath } from "./repository.js";

export interface UploadedFileLike {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
}

export interface MediaStorage {
  storeUploadedImage(file: UploadedFileLike): Promise<string>;
  normalizeTokenImage(image?: string): Promise<string | undefined>;
}

const extensionFromMime = (mimeType: string): string => {
  switch (mimeType) {
    case "image/png":
      return "png";
    case "image/jpeg":
      return "jpg";
    case "image/gif":
      return "gif";
    case "image/webp":
      return "webp";
    case "image/svg+xml":
      return "svg";
    default:
      return "bin";
  }
};

const parseDataUrl = (dataUrl: string): UploadedFileLike => {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    throw new Error("Unsupported image payload format");
  }

  const mimetype = match[1];
  const content = match[2];
  if (!mimetype || !content) {
    throw new Error("Malformed image payload");
  }

  return {
    buffer: Buffer.from(content, "base64"),
    mimetype,
    originalname: `upload.${extensionFromMime(mimetype)}`
  };
};

class LocalMediaStorage implements MediaStorage {
  public constructor(
    private readonly uploadsDir: string,
    private readonly publicBaseUrl: string
  ) {}

  public async storeUploadedImage(file: UploadedFileLike): Promise<string> {
    const extension = extensionFromMime(file.mimetype);
    const fileName = `${randomUUID()}.${extension}`;
    await mkdir(this.uploadsDir, { recursive: true });
    await writeFile(path.join(this.uploadsDir, fileName), file.buffer);
    return `${this.publicBaseUrl.replace(/\/$/, "")}/uploads/${fileName}`;
  }

  public async normalizeTokenImage(image?: string): Promise<string | undefined> {
    if (!image?.trim()) {
      return undefined;
    }

    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }

    if (image.startsWith("data:")) {
      return this.storeUploadedImage(parseDataUrl(image));
    }

    return image;
  }
}

class S3MediaStorage implements MediaStorage {
  private readonly client: S3Client;

  public constructor(
    private readonly bucket: string,
    private readonly region: string,
    private readonly publicBaseUrl: string,
    accessKeyId: string,
    secretAccessKey: string
  ) {
    this.client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey
      }
    });
  }

  public async storeUploadedImage(file: UploadedFileLike): Promise<string> {
    const extension = extensionFromMime(file.mimetype);
    const key = `launchpad/${randomUUID()}.${extension}`;
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype
      })
    );

    const baseUrl =
      this.publicBaseUrl ||
      `https://${this.bucket}.s3.${this.region}.amazonaws.com`;

    return `${baseUrl.replace(/\/$/, "")}/${key}`;
  }

  public async normalizeTokenImage(image?: string): Promise<string | undefined> {
    if (!image?.trim()) {
      return undefined;
    }

    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }

    if (image.startsWith("data:")) {
      return this.storeUploadedImage(parseDataUrl(image));
    }

    return image;
  }
}

export const createMediaStorage = (options: {
  mode: string;
  publicBaseUrl: string;
  s3Bucket: string;
  s3Region: string;
  s3AccessKey: string;
  s3SecretKey: string;
  s3PublicBaseUrl: string;
}): MediaStorage => {
  if (
    options.mode === "s3" &&
    options.s3Bucket &&
    options.s3Region &&
    options.s3AccessKey &&
    options.s3SecretKey
  ) {
    return new S3MediaStorage(
      options.s3Bucket,
      options.s3Region,
      options.s3PublicBaseUrl,
      options.s3AccessKey,
      options.s3SecretKey
    );
  }

  return new LocalMediaStorage(resolveWorkspacePath("data", "uploads"), options.publicBaseUrl);
};
