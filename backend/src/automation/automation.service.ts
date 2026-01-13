import { Injectable, Logger } from '@nestjs/common';
import { chromium, Browser, Page } from 'playwright';
import { VaultService } from '../vault/vault.service';
import { BaseConnector } from './connectors/base-connector';
import { AmityConnector } from './connectors/amity.connector';
import { UpesConnector } from './connectors/upes.connector';
import { PortalType } from '../portals/entities/portal-connection.entity';

@Injectable()
export class AutomationService {
  private readonly logger = new Logger(AutomationService.name);
  private browser: Browser | null = null;

  constructor(private vaultService: VaultService) {}

  /**
   * Get or create browser instance
   */
  private async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }
    return this.browser;
  }

  /**
   * Create connector instance based on portal type
   */
  private createConnector(
    portalType: PortalType,
    browser: Browser,
    page: Page,
  ): BaseConnector {
    switch (portalType) {
      case PortalType.AMITY:
        return new AmityConnector(browser, page);
      case PortalType.UPES:
        return new UpesConnector(browser, page);
      // Add more connectors here
      default:
        throw new Error(`Unsupported portal type: ${portalType}`);
    }
  }

  /**
   * Sync portal data for a connection
   */
  async syncPortal(
    portalType: PortalType,
    collegeId: string,
    credentialToken: string,
  ): Promise<any> {
    const browser = await this.getBrowser();
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });
    const page = await context.newPage();

    try {
      // Retrieve credentials from vault
      const password = await this.vaultService.retrieveCredentials(
        credentialToken,
      );

      // Create connector
      const connector = this.createConnector(portalType, browser, page);

      // Login
      const loginSuccess = await connector.login({
        collegeId,
        password,
      });

      if (!loginSuccess) {
        throw new Error('Login failed');
      }

      // Scrape data
      const data = await connector.scrapeData();

      // Logout
      await connector.logout();

      return data;
    } catch (error) {
      this.logger.error(`Sync failed for ${collegeId}:`, error);
      throw error;
    } finally {
      await page.close();
      await context.close();
    }
  }

  /**
   * Perform an action on portal
   */
  async performPortalAction(
    portalType: PortalType,
    collegeId: string,
    credentialToken: string,
    action: string,
    params: Record<string, any>,
  ): Promise<any> {
    const browser = await this.getBrowser();
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });
    const page = await context.newPage();

    try {
      // Retrieve credentials
      const password = await this.vaultService.retrieveCredentials(
        credentialToken,
      );

      // Create connector
      const connector = this.createConnector(portalType, browser, page);

      // Login
      await connector.login({ collegeId, password });

      // Perform action
      const result = await connector.performAction(action, params);

      // Take screenshot for verification
      const screenshot = await connector.takeScreenshot();

      // Logout
      await connector.logout();

      return {
        ...result,
        screenshot: screenshot.toString('base64'),
      };
    } catch (error) {
      this.logger.error(`Action failed for ${collegeId}:`, error);
      throw error;
    } finally {
      await page.close();
      await context.close();
    }
  }

  /**
   * Cleanup browser on shutdown
   */
  async onModuleDestroy() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}
