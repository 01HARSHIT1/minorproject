import { Page, Browser } from 'playwright';

export interface PortalCredentials {
  collegeId: string;
  password: string;
}

export interface PortalData {
  attendance?: {
    percentage: number;
    totalClasses: number;
    attended: number;
  };
  exams?: Array<{
    subject: string;
    date: Date;
    type: string;
    status: string;
  }>;
  results?: Array<{
    subject: string;
    marks: number;
    grade: string;
    semester: string;
    date: Date;
  }>;
  fees?: {
    totalDue: number;
    lastPaid: number;
    lastPaidDate: Date;
    dueDate: Date;
  };
  notices?: Array<{
    title: string;
    content: string;
    date: Date;
    category: string;
  }>;
  assignments?: Array<{
    id: string;
    title: string;
    course: string;
    courseCode: string;
    description: string;
    dueDate: Date;
    status: 'pending' | 'submitted' | 'overdue' | 'graded';
    submittedDate?: Date;
    maxMarks?: number;
    obtainedMarks?: number;
    submissionUrl?: string;
  }>;
}

export abstract class BaseConnector {
  protected browser: Browser;
  protected page: Page;

  constructor(browser: Browser, page: Page) {
    this.browser = browser;
    this.page = page;
  }

  /**
   * Login to the portal
   */
  abstract login(credentials: PortalCredentials): Promise<boolean>;

  /**
   * Scrape current portal state
   */
  abstract scrapeData(): Promise<PortalData>;

  /**
   * Perform an action on the portal (e.g., apply for exam)
   */
  abstract performAction(action: string, params: Record<string, any>): Promise<any>;

  /**
   * Logout from portal
   */
  async logout(): Promise<void> {
    // Default implementation - override if needed
    await this.page.close();
  }

  /**
   * Take screenshot for verification
   */
  async takeScreenshot(): Promise<Buffer> {
    return await this.page.screenshot({ fullPage: true });
  }
}
