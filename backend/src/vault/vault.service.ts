import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class VaultService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor(private configService: ConfigService) {
    const encryptionKey = this.configService.get<string>('ENCRYPTION_KEY');
    if (!encryptionKey || encryptionKey.length !== 32) {
      throw new Error('ENCRYPTION_KEY must be exactly 32 characters');
    }
    this.key = Buffer.from(encryptionKey, 'utf8');
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
   */
  async storeCredentials(
    token: string,
    collegeId: string,
    password: string,
  ): Promise<void> {
    const encrypted = this.encrypt(password);
    
    // Development: Store in memory
    // Production: Store in AWS Secrets Manager with key: `portal-${token}`
    if (process.env.NODE_ENV === 'production') {
      // TODO: Implement AWS Secrets Manager
      // await secretsManager.putSecretValue({
      //   SecretId: `portal-${token}`,
      //   SecretString: encrypted,
      // });
      throw new Error('Production secrets manager not implemented. Use AWS Secrets Manager.');
    } else {
      this.credentialStore.set(token, encrypted);
      console.log(`[VAULT] Stored credentials for token: ${token.substring(0, 8)}...`);
    }
  }

  /**
   * Retrieve and decrypt credentials (BOT USE ONLY)
   */
  async retrieveCredentials(token: string): Promise<string> {
    let encrypted: string;
    
    if (process.env.NODE_ENV === 'production') {
      // TODO: Retrieve from AWS Secrets Manager
      // const secret = await secretsManager.getSecretValue({
      //   SecretId: `portal-${token}`,
      // });
      // encrypted = secret.SecretString;
      throw new Error('Production secrets manager not implemented. Use AWS Secrets Manager.');
    } else {
      // Development: Retrieve from memory
      encrypted = this.credentialStore.get(token);
      if (!encrypted) {
        throw new Error(`Credentials not found for token: ${token.substring(0, 8)}...`);
      }
    }
    
    return this.decrypt(encrypted);
  }
}
