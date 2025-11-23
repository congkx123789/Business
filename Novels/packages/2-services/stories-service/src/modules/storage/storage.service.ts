import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly cdnDomain: string;
  private readonly region: string;

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.configService.get<string>("STORIES_S3_BUCKET", "");
    this.cdnDomain = this.configService.get<string>("STORIES_CDN_DOMAIN", "");
    this.region = this.configService.get<string>("AWS_REGION", "us-east-1");

    // Initialize S3 client
    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get<string>("AWS_ACCESS_KEY_ID", ""),
        secretAccessKey: this.configService.get<string>("AWS_SECRET_ACCESS_KEY", ""),
      },
    });
  }

  /**
   * Build public URL for S3 object
   * Uses CloudFront CDN if configured, otherwise falls back to S3 direct URL
   */
  buildPublicUrl(key: string): string {
    if (!key) {
      return "";
    }

    // If already a full URL, return as-is
    if (key.startsWith("http")) {
      return key;
    }

    // Use CloudFront CDN if configured
    if (this.cdnDomain) {
      return `https://${this.cdnDomain}/${key}`;
    }

    // Fallback to S3 direct URL
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  /**
   * Upload content to S3
   * @param key S3 object key (path)
   * @param content Content to upload (string or Buffer)
   * @param contentType MIME type (default: text/plain)
   * @returns S3 object key
   */
  async uploadContent(key: string, content: string | Buffer, contentType = "text/plain"): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: content,
        ContentType: contentType,
      });

      await this.s3Client.send(command);
      this.logger.log(`Successfully uploaded content to S3: ${key}`);
      return key;
    } catch (error) {
      this.logger.error(`Failed to upload content to S3: ${key}`, error);
      throw error;
    }
  }

  /**
   * Get content from S3
   * @param key S3 object key
   * @returns Content as string
   */
  async getContent(key: string): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const response = await this.s3Client.send(command);
      const content = await response.Body?.transformToString();
      return content || "";
    } catch (error) {
      this.logger.error(`Failed to get content from S3: ${key}`, error);
      throw error;
    }
  }

  /**
   * Delete content from S3
   * @param key S3 object key
   */
  async deleteContent(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.log(`Successfully deleted content from S3: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete content from S3: ${key}`, error);
      throw error;
    }
  }

  /**
   * Create a presigned download URL for S3 object
   * @param key S3 object key
   * @param expiresInSeconds URL expiration time in seconds (default: 300 = 5 minutes)
   * @returns Presigned URL and expiration time
   */
  async createDownloadUrl(key: string, expiresInSeconds = 300) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const url = await getSignedUrl(this.s3Client, command, { expiresIn: expiresInSeconds });
      const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

      return {
        url,
        expiresAt,
      };
    } catch (error) {
      this.logger.error(`Failed to create presigned URL for S3 object: ${key}`, error);
      throw error;
    }
  }

  /**
   * Generate S3 key for chapter content
   * @param storyId Story ID
   * @param chapterId Chapter ID
   * @returns S3 key path
   */
  generateChapterKey(storyId: number, chapterId: number): string {
    return `stories/${storyId}/chapters/${chapterId}.txt`;
  }

  /**
   * Generate S3 key for story cover image
   * @param storyId Story ID
   * @param extension File extension (default: jpg)
   * @returns S3 key path
   */
  generateCoverImageKey(storyId: number, extension = "jpg"): string {
    return `stories/${storyId}/cover.${extension}`;
  }
}


