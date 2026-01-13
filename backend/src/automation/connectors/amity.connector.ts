import { BaseConnector, PortalCredentials, PortalData } from './base-connector';

export class AmityConnector extends BaseConnector {
  private readonly loginUrl = 'https://student.amity.edu';

  async login(credentials: PortalCredentials): Promise<boolean> {
    try {
      await this.page.goto(this.loginUrl);
      await this.page.waitForSelector('#username', { timeout: 10000 });

      // Fill login form
      await this.page.fill('#username', credentials.collegeId);
      await this.page.fill('#password', credentials.password);
      await this.page.click('button[type="submit"]');

      // Wait for dashboard
      await this.page.waitForSelector('.dashboard', { timeout: 15000 });
      return true;
    } catch (error) {
      console.error('[Amity] Login failed:', error);
      return false;
    }
  }

  async scrapeData(): Promise<PortalData> {
    const data: PortalData = {};

    try {
      // Scrape attendance
      const attendanceElement = await this.page.$('.attendance-percentage');
      if (attendanceElement) {
        const percentage = parseFloat(
          await attendanceElement.textContent() || '0',
        );
        data.attendance = {
          percentage,
          totalClasses: 0, // Extract from page
          attended: 0, // Extract from page
        };
      }

      // Scrape exams
      const examRows = await this.page.$$('.exam-row');
      data.exams = await Promise.all(
        examRows.map(async (row) => ({
          subject: await row.$eval('.subject', (el) => el.textContent || ''),
          date: new Date(
            await row.$eval('.date', (el) => el.textContent || ''),
          ),
          type: await row.$eval('.type', (el) => el.textContent || ''),
          status: await row.$eval('.status', (el) => el.textContent || ''),
        })),
      );

      // Scrape notices
      const noticeElements = await this.page.$$('.notice-item');
      data.notices = await Promise.all(
        noticeElements.map(async (el) => ({
          title: await el.$eval('.title', (e) => e.textContent || ''),
          content: await el.$eval('.content', (e) => e.textContent || ''),
          date: new Date(await el.$eval('.date', (e) => e.textContent || '')),
          category: await el.$eval('.category', (e) => e.textContent || ''),
        })),
      );

      // Scrape fees
      const feesElement = await this.page.$('.fees-due');
      if (feesElement) {
        const amountText = await feesElement.textContent();
        data.fees = {
          totalDue: parseFloat(amountText?.replace(/[^\d.]/g, '') || '0'),
          lastPaid: 0,
          lastPaidDate: new Date(),
          dueDate: new Date(),
        };
      }
    } catch (error) {
      console.error('[Amity] Scraping error:', error);
    }

    return data;
  }

  async performAction(action: string, params: Record<string, any>): Promise<any> {
    switch (action) {
      case 'apply_exam':
        return await this.applyForExam(params);
      case 'download_admit_card':
        return await this.downloadAdmitCard(params);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  private async applyForExam(params: Record<string, any>): Promise<any> {
    await this.page.goto(`${this.loginUrl}/exam/apply`);
    // Fill form and submit
    // Return result
    return { success: true, message: 'Exam application submitted' };
  }

  private async downloadAdmitCard(params: Record<string, any>): Promise<any> {
    await this.page.goto(`${this.loginUrl}/exam/admit-card`);
    // Download file
    const download = await this.page.waitForEvent('download');
    const path = await download.path();
    return { success: true, filePath: path };
  }
}
