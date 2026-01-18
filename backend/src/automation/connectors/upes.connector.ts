import { BaseConnector, PortalCredentials, PortalData } from './base-connector';

export class UpesConnector extends BaseConnector {
  private readonly loginUrl = 'https://myupes-beta.upes.ac.in/';

  async login(credentials: PortalCredentials): Promise<boolean> {
    try {
      await this.page.goto(this.loginUrl, { waitUntil: 'networkidle' });
      
      // Wait for page to load - try multiple common selectors
      await this.page.waitForTimeout(2000);
      
      // Common login field selectors for UPES portal
      const usernameSelectors = [
        'input[name="username"]',
        'input[name="userid"]',
        'input[name="email"]',
        'input[id="username"]',
        'input[id="userid"]',
        'input[id="email"]',
        'input[type="text"]',
        'input[placeholder*="username" i]',
        'input[placeholder*="user id" i]',
        'input[placeholder*="email" i]',
      ];

      const passwordSelectors = [
        'input[name="password"]',
        'input[name="pwd"]',
        'input[id="password"]',
        'input[id="pwd"]',
        'input[type="password"]',
      ];

      const submitSelectors = [
        'button[type="submit"]',
        'input[type="submit"]',
        'button:has-text("Login")',
        'button:has-text("Sign In")',
        'button:has-text("Log In")',
        '.login-button',
        '#login-button',
        '#submit',
      ];

      // Find and fill username
      let usernameFilled = false;
      for (const selector of usernameSelectors) {
        try {
          const element = await this.page.$(selector);
          if (element) {
            await this.page.fill(selector, credentials.collegeId);
            usernameFilled = true;
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (!usernameFilled) {
        throw new Error('Could not find username field');
      }

      // Find and fill password
      let passwordFilled = false;
      for (const selector of passwordSelectors) {
        try {
          const element = await this.page.$(selector);
          if (element) {
            await this.page.fill(selector, credentials.password);
            passwordFilled = true;
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (!passwordFilled) {
        throw new Error('Could not find password field');
      }

      // Click submit button
      let submitted = false;
      for (const selector of submitSelectors) {
        try {
          const element = await this.page.$(selector);
          if (element) {
            await this.page.click(selector);
            submitted = true;
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (!submitted) {
        // Try pressing Enter as fallback
        await this.page.keyboard.press('Enter');
      }

      // Wait for navigation or dashboard to appear
      await this.page.waitForTimeout(3000);
      
      // Check if login was successful by looking for common dashboard elements
      const dashboardIndicators = [
        '.dashboard',
        '.student-dashboard',
        '.home',
        '.main-content',
        '[class*="dashboard" i]',
        '[id*="dashboard" i]',
        'nav',
        '.sidebar',
        '.menu',
      ];

      for (const indicator of dashboardIndicators) {
        try {
          await this.page.waitForSelector(indicator, { timeout: 5000 });
          return true;
        } catch (e) {
          continue;
        }
      }

      // If URL changed, assume login successful
      const currentUrl = this.page.url();
      if (currentUrl !== this.loginUrl && !currentUrl.includes('login')) {
        return true;
      }

      // Check for error messages
      const errorSelectors = [
        '.error',
        '.alert-danger',
        '[class*="error" i]',
        '[id*="error" i]',
      ];

      for (const selector of errorSelectors) {
        const errorElement = await this.page.$(selector);
        if (errorElement) {
          const errorText = await errorElement.textContent();
          if (errorText && errorText.trim().length > 0) {
            throw new Error(`Login error: ${errorText}`);
          }
        }
      }

      return false;
    } catch (error) {
      console.error('[UPES] Login failed:', error);
      // Take screenshot for debugging
      try {
        await this.page.screenshot({ path: 'upes-login-error.png' });
      } catch (e) {
        // Ignore screenshot errors
      }
      return false;
    }
  }

  async scrapeData(): Promise<PortalData> {
    const data: PortalData = {};

    try {
      // Wait for page to be fully loaded
      await this.page.waitForTimeout(2000);

      // Scrape attendance
      const attendanceSelectors = [
        '.attendance',
        '.attendance-percentage',
        '[class*="attendance" i]',
        '[id*="attendance" i]',
        'td:has-text("Attendance")',
        'th:has-text("Attendance")',
      ];

      for (const selector of attendanceSelectors) {
        try {
          const element = await this.page.$(selector);
          if (element) {
            const text = await element.textContent();
            const percentageMatch = text?.match(/(\d+\.?\d*)\s*%/);
            if (percentageMatch) {
              const percentage = parseFloat(percentageMatch[1]);
              data.attendance = {
                percentage,
                totalClasses: 0,
                attended: 0,
              };
              break;
            }
          }
        } catch (e) {
          continue;
        }
      }

      // Scrape exams - look for exam-related sections
      const examSelectors = [
        '.exams',
        '.exam-schedule',
        '[class*="exam" i]',
        '[id*="exam" i]',
        'table:has-text("Exam")',
      ];

      const exams: Array<{
        subject: string;
        date: Date;
        type: string;
        status: string;
      }> = [];

      for (const selector of examSelectors) {
        try {
          const elements = await this.page.$$(selector);
          for (const element of elements) {
            const text = await element.textContent();
            if (text && (text.includes('Exam') || text.includes('Test'))) {
              // Try to extract exam information
              const rows = await element.$$('tr, .exam-item, .exam-row');
              for (const row of rows) {
                const rowText = await row.textContent();
                if (rowText && rowText.length > 10) {
                  exams.push({
                    subject: rowText.split('\n')[0] || 'Unknown',
                    date: new Date(),
                    type: 'Regular',
                    status: 'Scheduled',
                  });
                }
              }
            }
          }
        } catch (e) {
          continue;
        }
      }

      if (exams.length > 0) {
        data.exams = exams;
      }

      // Scrape notices/announcements
      const noticeSelectors = [
        '.notices',
        '.announcements',
        '.news',
        '[class*="notice" i]',
        '[class*="announcement" i]',
        '[id*="notice" i]',
        '[id*="announcement" i]',
      ];

      const notices: Array<{
        title: string;
        content: string;
        date: Date;
        category: string;
      }> = [];

      for (const selector of noticeSelectors) {
        try {
          const elements = await this.page.$$(selector);
          for (const element of elements) {
            const items = await element.$$('li, .notice-item, .announcement-item, tr');
            for (const item of items) {
              const text = await item.textContent();
              if (text && text.trim().length > 0) {
                const lines = text.split('\n').filter((l) => l.trim().length > 0);
                notices.push({
                  title: lines[0] || 'Notice',
                  content: lines.slice(1).join(' ') || text,
                  date: new Date(),
                  category: 'General',
                });
              }
            }
          }
        } catch (e) {
          continue;
        }
      }

      if (notices.length > 0) {
        data.notices = notices;
      }

      // Scrape fees
      const feesSelectors = [
        '.fees',
        '.fee-due',
        '.payment',
        '[class*="fee" i]',
        '[id*="fee" i]',
        'td:has-text("Fee")',
        'th:has-text("Fee")',
      ];

      for (const selector of feesSelectors) {
        try {
          const element = await this.page.$(selector);
          if (element) {
            const text = await element.textContent();
            const amountMatch = text?.match(/₹?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
            if (amountMatch) {
              const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
              data.fees = {
                totalDue: amount,
                lastPaid: 0,
                lastPaidDate: new Date(),
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
              };
              break;
            }
          }
        } catch (e) {
          continue;
        }
      }

      // Scrape results
      const resultsSelectors = [
        '.results',
        '.grades',
        '[class*="result" i]',
        '[id*="result" i]',
        'table:has-text("Result")',
      ];

      const results: Array<{
        subject: string;
        marks: number;
        grade: string;
        semester: string;
        date: Date;
      }> = [];

      for (const selector of resultsSelectors) {
        try {
          const elements = await this.page.$$(selector);
          for (const element of elements) {
            const rows = await element.$$('tr, .result-item');
            for (const row of rows) {
              const text = await row.textContent();
              if (text && text.length > 10) {
                const cells = text.split('\t').filter((c) => c.trim().length > 0);
                if (cells.length >= 2) {
                  const marksMatch = cells[1]?.match(/(\d+)/);
                  results.push({
                    subject: cells[0] || 'Unknown',
                    marks: marksMatch ? parseFloat(marksMatch[1]) : 0,
                    grade: cells[2] || 'N/A',
                    semester: cells[3] || 'N/A',
                    date: new Date(),
                  });
                }
              }
            }
          }
        } catch (e) {
          continue;
        }
      }

      if (results.length > 0) {
        data.results = results;
      }

      // Scrape assignments - navigate to LMS if needed
      // Assignments are typically in LMS -> Courses -> Individual Course -> Assignments
      // For now, we'll try to detect assignment-related elements on current page
      const assignmentSelectors = [
        '.assignments',
        '.assignment',
        '[class*="assignment" i]',
        '[id*="assignment" i]',
        'table:has-text("Assignment")',
        '.submission',
        '[class*="submission" i]',
      ];

      const assignments: Array<{
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
      }> = [];

      for (const selector of assignmentSelectors) {
        try {
          const elements = await this.page.$$(selector);
          for (const element of elements) {
            const rows = await element.$$('tr, .assignment-item, .assignment-row');
            for (const row of rows) {
              const text = await row.textContent();
              if (text && text.length > 10 && (text.includes('Assignment') || text.includes('Submit'))) {
                const cells = text.split('\n').filter((c) => c.trim().length > 0);
                const dueDateMatch = text.match(/(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/);
                const statusMatch = text.match(/(pending|submitted|overdue|graded)/i);
                
                assignments.push({
                  id: `assign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  title: cells[0] || 'Assignment',
                  course: cells[1] || 'Unknown Course',
                  courseCode: cells[2] || '',
                  description: cells.slice(3).join(' ') || '',
                  dueDate: dueDateMatch ? new Date(dueDateMatch[1]) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                  status: (statusMatch ? statusMatch[1].toLowerCase() : 'pending') as 'pending' | 'submitted' | 'overdue' | 'graded',
                });
              }
            }
          }
        } catch (e) {
          continue;
        }
      }

      if (assignments.length > 0) {
        data.assignments = assignments;
      }
    } catch (error) {
      console.error('[UPES] Scraping error:', error);
    }

    return data;
  }

  async performAction(action: string, params: Record<string, any>): Promise<any> {
    switch (action) {
      case 'apply_exam':
        return await this.applyForExam(params);
      case 'download_admit_card':
        return await this.downloadAdmitCard(params);
      case 'download_result':
        return await this.downloadResult(params);
      case 'pay_fees':
        return await this.payFees(params);
      case 'download_fee_receipt':
        return await this.downloadFeeReceipt(params);
      case 'apply_leave':
        return await this.applyLeave(params);
      case 'submit_assignment':
        return await this.submitAssignment(params);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  private async applyForExam(params: Record<string, any>): Promise<any> {
    try {
      // Look for exam application links/buttons
      const examLinkSelectors = [
        'a:has-text("Exam")',
        'a:has-text("Apply")',
        'button:has-text("Exam")',
        'button:has-text("Apply")',
        '[href*="exam" i]',
        '[href*="apply" i]',
      ];

      for (const selector of examLinkSelectors) {
        try {
          const element = await this.page.$(selector);
          if (element) {
            await element.click();
            await this.page.waitForTimeout(2000);

            // Fill exam form if needed
            const checkboxes = await this.page.$$('input[type="checkbox"]');
            for (const checkbox of checkboxes) {
              await checkbox.check();
            }

            // Submit form
            const submitButton = await this.page.$('button[type="submit"], input[type="submit"]');
            if (submitButton) {
              await submitButton.click();
              await this.page.waitForTimeout(2000);
            }

            return { success: true, message: 'Exam application submitted successfully' };
          }
        } catch (e) {
          continue;
        }
      }

      return { success: false, message: 'Could not find exam application form' };
    } catch (error) {
      return { success: false, message: `Error: ${error.message}` };
    }
  }

  private async downloadAdmitCard(params: Record<string, any>): Promise<any> {
    try {
      // Look for admit card download links
      const admitCardSelectors = [
        'a:has-text("Admit Card")',
        'a:has-text("Download")',
        'button:has-text("Admit Card")',
        '[href*="admit" i]',
        '[href*="download" i]',
      ];

      for (const selector of admitCardSelectors) {
        try {
          const element = await this.page.$(selector);
          if (element) {
            const [download] = await Promise.all([
              this.page.waitForEvent('download', { timeout: 10000 }).catch(() => null),
              element.click(),
            ]);

            if (download) {
              const path = await download.path();
              return { success: true, filePath: path, message: 'Admit card downloaded' };
            }
          }
        } catch (e) {
          continue;
        }
      }

      return { success: false, message: 'Could not find admit card download link' };
    } catch (error) {
      return { success: false, message: `Error: ${error.message}` };
    }
  }

  private async downloadResult(params: Record<string, any>): Promise<any> {
    try {
      const resultSelectors = [
        'a:has-text("Result")',
        'a:has-text("Download")',
        '[href*="result" i]',
      ];

      for (const selector of resultSelectors) {
        try {
          const element = await this.page.$(selector);
          if (element) {
            const [download] = await Promise.all([
              this.page.waitForEvent('download', { timeout: 10000 }).catch(() => null),
              element.click(),
            ]);

            if (download) {
              const path = await download.path();
              return { success: true, filePath: path, message: 'Result downloaded' };
            }
          }
        } catch (e) {
          continue;
        }
      }

      return { success: false, message: 'Could not find result download link' };
    } catch (error) {
      return { success: false, message: `Error: ${error.message}` };
    }
  }

  private async payFees(params: Record<string, any>): Promise<any> {
    try {
      const feeSelectors = [
        'a:has-text("Pay Fee")',
        'a:has-text("Payment")',
        'button:has-text("Pay")',
        '[href*="payment" i]',
        '[href*="fee" i]',
      ];

      for (const selector of feeSelectors) {
        try {
          const element = await this.page.$(selector);
          if (element) {
            await element.click();
            await this.page.waitForTimeout(2000);
            return { success: true, message: 'Redirected to payment page' };
          }
        } catch (e) {
          continue;
        }
      }

      return { success: false, message: 'Could not find payment option' };
    } catch (error) {
      return { success: false, message: `Error: ${error.message}` };
    }
  }

  private async downloadFeeReceipt(params: Record<string, any>): Promise<any> {
    try {
      const receiptSelectors = [
        'a:has-text("Receipt")',
        'a:has-text("Download Receipt")',
        '[href*="receipt" i]',
      ];

      for (const selector of receiptSelectors) {
        try {
          const element = await this.page.$(selector);
          if (element) {
            const [download] = await Promise.all([
              this.page.waitForEvent('download', { timeout: 10000 }).catch(() => null),
              element.click(),
            ]);

            if (download) {
              const path = await download.path();
              return { success: true, filePath: path, message: 'Fee receipt downloaded' };
            }
          }
        } catch (e) {
          continue;
        }
      }

      return { success: false, message: 'Could not find receipt download link' };
    } catch (error) {
      return { success: false, message: `Error: ${error.message}` };
    }
  }

  private async applyLeave(params: Record<string, any>): Promise<any> {
    try {
      const leaveSelectors = [
        'a:has-text("Leave")',
        'a:has-text("Apply Leave")',
        'button:has-text("Leave")',
        '[href*="leave" i]',
      ];

      for (const selector of leaveSelectors) {
        try {
          const element = await this.page.$(selector);
          if (element) {
            await element.click();
            await this.page.waitForTimeout(2000);

            // Fill leave form
            const reasonField = await this.page.$('input[name*="reason" i], textarea[name*="reason" i]');
            if (reasonField && params.reason) {
              await reasonField.fill(params.reason);
            }

            const dateField = await this.page.$('input[type="date"], input[name*="date" i]');
            if (dateField && params.date) {
              await dateField.fill(params.date);
            }

            // Submit
            const submitButton = await this.page.$('button[type="submit"], input[type="submit"]');
            if (submitButton) {
              await submitButton.click();
              await this.page.waitForTimeout(2000);
            }

            return { success: true, message: 'Leave application submitted' };
          }
        } catch (e) {
          continue;
        }
      }

      return { success: false, message: 'Could not find leave application form' };
    } catch (error) {
      return { success: false, message: `Error: ${error.message}` };
    }
  }

  private async submitAssignment(params: Record<string, any>): Promise<any> {
    try {
      const { assignmentId, filePath, courseCode, courseName, comments } = params;

      // Navigate to LMS if not already there
      const lmsLinkSelectors = [
        'a:has-text("LMS")',
        'a[href*="lms" i]',
        '.lms-link',
        '[href*="lms.upes.ac.in"]',
      ];

      let lmsNavigated = false;
      for (const selector of lmsLinkSelectors) {
        try {
          const element = await this.page.$(selector);
          if (element) {
            await element.click();
            await this.page.waitForTimeout(3000);
            lmsNavigated = true;
            break;
          }
        } catch (e) {
          continue;
        }
      }

      // If LMS link found, wait for LMS to load
      if (lmsNavigated) {
        await this.page.waitForTimeout(3000);
      }

      // Try to find assignment submission page
      // Common selectors for assignment submission
      const assignmentLinkSelectors = [
        `a:has-text("${courseName || courseCode || 'Assignment'}")`,
        `a[href*="assignment" i]`,
        `a[href*="submit" i]`,
        'button:has-text("Submit")',
        'a:has-text("Submit Assignment")',
        '.assignment-submit',
      ];

      let assignmentPageFound = false;
      for (const selector of assignmentLinkSelectors) {
        try {
          const element = await this.page.$(selector);
          if (element) {
            await element.click();
            await this.page.waitForTimeout(2000);
            assignmentPageFound = true;
            break;
          }
        } catch (e) {
          continue;
        }
      }

      // Find file upload input
      const fileInputSelectors = [
        'input[type="file"]',
        'input[name*="file" i]',
        'input[name*="upload" i]',
        'input[id*="file" i]',
        'input[id*="upload" i]',
      ];

      let fileInput = null;
      for (const selector of fileInputSelectors) {
        try {
          fileInput = await this.page.$(selector);
          if (fileInput) {
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (!fileInput) {
        return { success: false, message: 'Could not find file upload input on assignment page' };
      }

      // Upload file
      if (filePath) {
        await fileInput.setInputFiles(filePath);
        await this.page.waitForTimeout(1000);
      }

      // Fill comments if provided
      if (comments) {
        const commentSelectors = [
          'textarea[name*="comment" i]',
          'textarea[name*="note" i]',
          'textarea[id*="comment" i]',
          'input[name*="comment" i]',
        ];

        for (const selector of commentSelectors) {
          try {
            const commentField = await this.page.$(selector);
            if (commentField) {
              await commentField.fill(comments);
              break;
            }
          } catch (e) {
            continue;
          }
        }
      }

      // Submit form
      const submitButtonSelectors = [
        'button[type="submit"]:has-text("Submit")',
        'input[type="submit"]:has-text("Submit")',
        'button:has-text("Submit Assignment")',
        'button:has-text("Upload")',
        'button.submit',
        '#submit',
      ];

      let submitted = false;
      for (const selector of submitButtonSelectors) {
        try {
          const submitBtn = await this.page.$(selector);
          if (submitBtn) {
            await submitBtn.click();
            await this.page.waitForTimeout(3000);
            submitted = true;
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (!submitted) {
        // Try pressing Enter as fallback
        await this.page.keyboard.press('Enter');
        await this.page.waitForTimeout(2000);
      }

      // Check for success message
      const successIndicators = [
        '.success',
        '.alert-success',
        '[class*="success" i]',
        ':has-text("submitted successfully")',
        ':has-text("uploaded successfully")',
      ];

      let successFound = false;
      for (const selector of successIndicators) {
        try {
          const element = await this.page.$(selector);
          if (element) {
            const text = await element.textContent();
            if (text && text.toLowerCase().includes('success')) {
              successFound = true;
              break;
            }
          }
        } catch (e) {
          continue;
        }
      }

      return {
        success: submitted || successFound,
        message: successFound
          ? 'Assignment submitted successfully'
          : submitted
          ? 'Submission initiated (please verify on portal)'
          : 'Could not confirm submission status',
        timestamp: new Date(),
      };
    } catch (error) {
      return { success: false, message: `Error: ${error.message}` };
    }
  }
}
