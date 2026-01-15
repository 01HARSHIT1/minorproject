import { Injectable, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class VaultService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor(private configService: ConfigService) {
    const encryptionKey = this.configService.get<string>('ENCRYPTION_KEY');

    // If ENCRYPTION_KEY is not provided, generate a default for development
    // In production, this MUST be set as an environment variable
    let finalKey: string;
    if (!encryptionKey || encryptionKey.length !== 32) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('ENCRYPTION_KEY must be exactly 32 characters in production. Please set it as an environment variable.');
      }
      // Development fallback: use a fixed 32-character key
      // WARNING: This is NOT secure for production!
      console.warn('[VAULT] WARNING: Using default ENCRYPTION_KEY for development. This is NOT secure for production!');
      finalKey = 'dev-encryption-key-32chars!!!'; // Exactly 32 characters
    } else {
      finalKey = encryptionKey;
    }

    this.key = Buffer.from(finalKey, 'utf8');
  }

  /**
   * Encrypt credentials before storing
   * Returns encrypted data with IV and auth tag
   */
  encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Combine IV, auth tag, and encrypted data
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypt credentials for bot use only
   * NEVER expose this to frontend or AI
   */
  decrypt(encryptedData: string): string {
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Generate a secure token for credential reference
   * This token is stored in DB, not the actual credentials
   */
  generateCredentialToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // In-memory store for development (NOT for production)
  private credentialStore: Map<string, string> = new Map();

  /**
   * Store encrypted credentials
   * In production, use AWS Secrets Manager or Hashicorp Vault
   * For now, using in-memory store (not recommended for production with multiple instances)
   */
  async storeCredentials(
    token: string,
    collegeId: string,
    password: string,
  ): Promise<void> {
    const encrypted = this.encrypt(password);

    // For now, use in-memory store even in production
    // TODO: Implement AWS Secrets Manager or Hashicorp Vault for production
    // This works for single-instance deployments but not for multi-instance
    this.credentialStore.set(token, encrypted);
    console.log(`[VAULT] Stored credentials for token: ${token.substring(0, 8)}...`);

    // Future: AWS Secrets Manager implementation
    // if (process.env.AWS_SECRETS_MANAGER_ENABLED === 'true') {
    //   await secretsManager.putSecretValue({
    //     SecretId: `portal-${token}`,
    //     SecretString: encrypted,
    //   });
    // }
  }

  /**
   * Retrieve and decrypt credentials (BOT USE ONLY)
   */
  async retrieveCredentials(token: string): Promise<string> {
    let encrypted: string;

    // For now, use in-memory store even in production
    // TODO: Implement AWS Secrets Manager or Hashicorp Vault for production
    encrypted = this.credentialStore.get(token);
    if (!encrypted) {
      throw new Error(`Credentials not found for token: ${token.substring(0, 8)}...`);
    }

    // Future: AWS Secrets Manager implementation
    // if (process.env.AWS_SECRETS_MANAGER_ENABLED === 'true') {
    //   const secret = await secretsManager.getSecretValue({
    //     SecretId: `portal-${token}`,
    //   });
    //   encrypted = secret.SecretString;
    // }

    return this.decrypt(encrypted);
  }
}
