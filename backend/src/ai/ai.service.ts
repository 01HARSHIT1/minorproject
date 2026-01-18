import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { PortalData } from '../automation/connectors/base-connector';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  /**
   * Analyze portal data and provide insights
   */
  async analyzePortalData(data: PortalData): Promise<{
    summary: string;
    alerts: string[];
    recommendations: string[];
    riskLevel: 'low' | 'medium' | 'high';
  }> {
    if (!this.openai) {
      return this.getDefaultAnalysis(data);
    }

    try {
      const prompt = this.buildAnalysisPrompt(data);
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are an AI assistant helping students monitor their academic progress. Analyze portal data and provide actionable insights.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
      });

      const content = response.choices[0].message.content;
      return this.parseAnalysisResponse(content || '');
    } catch (error) {
      this.logger.error('AI analysis failed:', error);
      return this.getDefaultAnalysis(data);
    }
  }

  /**
   * Generate recommendations based on data
   */
  async generateRecommendations(data: PortalData): Promise<string[]> {
    const recommendations: string[] = [];

    // Attendance recommendations
    if (data.attendance && data.attendance.percentage < 75) {
      recommendations.push(
        `Your attendance is ${data.attendance.percentage}%. Consider applying for medical leave to improve it.`,
      );
    }

    // Fee recommendations
    if (data.fees && data.fees.totalDue > 0) {
      recommendations.push(
        `You have ₹${data.fees.totalDue} in pending fees. Pay before ${data.fees.dueDate.toLocaleDateString()} to avoid penalties.`,
      );
    }

    // Exam recommendations
    if (data.exams && data.exams.length > 0) {
      const upcomingExams = data.exams.filter(
        (exam) => new Date(exam.date) > new Date(),
      );
      if (upcomingExams.length > 0) {
        recommendations.push(
          `You have ${upcomingExams.length} upcoming exam(s). Start preparing now!`,
        );
      }
    }

    // Assignment recommendations
    if (data.assignments && data.assignments.length > 0) {
      const pendingAssignments = data.assignments.filter(
        (assign) => assign.status === 'pending' || assign.status === 'overdue',
      );
      if (pendingAssignments.length > 0) {
        const overdue = pendingAssignments.filter(
          (assign) => new Date(assign.dueDate) < new Date(),
        );
        if (overdue.length > 0) {
          recommendations.push(
            `⚠️ ${overdue.length} assignment(s) are overdue. Submit immediately!`,
          );
        } else {
          const dueSoon = pendingAssignments.filter(
            (assign) => {
              const hoursUntilDue = (new Date(assign.dueDate).getTime() - Date.now()) / (1000 * 60 * 60);
              return hoursUntilDue > 0 && hoursUntilDue < 48;
            },
          );
          if (dueSoon.length > 0) {
            recommendations.push(
              `📝 ${dueSoon.length} assignment(s) due within 48 hours. Complete and submit soon!`,
            );
          }
        }
      }
    }

    return recommendations;
  }

  /**
   * Decide if an action should be taken automatically
   */
  async shouldAutoAction(
    action: string,
    data: PortalData,
  ): Promise<{ should: boolean; reason: string }> {
    // Example: Auto-apply for medical leave if attendance is critically low
    if (action === 'apply_medical_leave' && data.attendance) {
      if (data.attendance.percentage < 70) {
        return {
          should: true,
          reason: 'Attendance is critically low. Medical leave application recommended.',
        };
      }
    }

    return { should: false, reason: 'No automatic action needed.' };
  }

  /**
   * Review an assignment file before submission
   */
  async reviewAssignment(fileContent: string | Buffer, assignmentDetails: {
    title: string;
    course: string;
    description?: string;
    dueDate: Date;
    fileType: string;
    fileName: string;
  }): Promise<{
    isValid: boolean;
    score: number; // 0-100
    issues: Array<{
      type: 'error' | 'warning' | 'suggestion';
      message: string;
      severity: 'low' | 'medium' | 'high';
    }>;
    suggestions: string[];
    deadlineStatus: 'on_time' | 'warning' | 'overdue';
    formatCheck: {
      valid: boolean;
      message: string;
    };
  }> {
    const issues: Array<{
      type: 'error' | 'warning' | 'suggestion';
      message: string;
      severity: 'low' | 'medium' | 'high';
    }> = [];
    const suggestions: string[] = [];
    let score = 100;

    // Check deadline
    const now = new Date();
    const dueDate = new Date(assignmentDetails.dueDate);
    const timeUntilDue = dueDate.getTime() - now.getTime();
    const hoursUntilDue = timeUntilDue / (1000 * 60 * 60);
    
    let deadlineStatus: 'on_time' | 'warning' | 'overdue' = 'on_time';
    if (hoursUntilDue < 0) {
      deadlineStatus = 'overdue';
      issues.push({
        type: 'error',
        message: 'Assignment deadline has passed!',
        severity: 'high',
      });
      score -= 30;
    } else if (hoursUntilDue < 24) {
      deadlineStatus = 'warning';
      issues.push({
        type: 'warning',
        message: `Assignment due in ${Math.round(hoursUntilDue)} hours. Submit soon!`,
        severity: 'high',
      });
      score -= 10;
    } else if (hoursUntilDue < 48) {
      deadlineStatus = 'warning';
      issues.push({
        type: 'warning',
        message: `Assignment due in ${Math.round(hoursUntilDue / 24)} days.`,
        severity: 'medium',
      });
    }

    // Basic format check (file type validation)
    const allowedFormats = ['pdf', 'doc', 'docx', 'txt', 'zip', 'rar'];
    const fileExtension = assignmentDetails.fileName.split('.').pop()?.toLowerCase() || '';
    const formatCheck = {
      valid: allowedFormats.includes(fileExtension),
      message: allowedFormats.includes(fileExtension)
        ? `File format (.${fileExtension}) is acceptable`
        : `Warning: .${fileExtension} format may not be accepted. Recommended: PDF or DOCX`,
    };

    if (!formatCheck.valid) {
      issues.push({
        type: 'warning',
        message: formatCheck.message,
        severity: 'medium',
      });
      score -= 15;
    }

    // File size check (if buffer provided)
    if (Buffer.isBuffer(fileContent)) {
      const fileSizeMB = fileContent.length / (1024 * 1024);
      if (fileSizeMB > 10) {
        issues.push({
          type: 'warning',
          message: `File size (${fileSizeMB.toFixed(2)} MB) may be too large. Check portal limits.`,
          severity: 'medium',
        });
        score -= 5;
      }
    }

    // Use AI for content review if OpenAI is available
    if (this.openai && typeof fileContent === 'string' && fileContent.length > 0) {
      try {
        const contentReview = await this.openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content:
                'You are an AI assistant helping students review their assignment submissions. Provide constructive feedback on grammar, formatting, and compliance with assignment requirements.',
            },
            {
              role: 'user',
              content: `Review this assignment submission:

Assignment: ${assignmentDetails.title}
Course: ${assignmentDetails.course}
Description: ${assignmentDetails.description || 'N/A'}

Content (first 2000 chars):
${fileContent.substring(0, 2000)}

Provide:
1. Grammar/spelling issues (if any)
2. Formatting suggestions
3. Compliance check with assignment description
4. Overall quality assessment`,
            },
          ],
          temperature: 0.5,
        });

        const aiFeedback = contentReview.choices[0].message.content || '';
        
        // Parse AI feedback for suggestions
        if (aiFeedback.toLowerCase().includes('grammar') || aiFeedback.toLowerCase().includes('spelling')) {
          suggestions.push('Consider reviewing grammar and spelling before submission');
          score -= 5;
        }
        
        if (aiFeedback.toLowerCase().includes('format')) {
          suggestions.push('Check formatting requirements match assignment guidelines');
        }
      } catch (error) {
        this.logger.warn('AI content review failed, using basic validation only:', error);
      }
    }

    // General suggestions
    if (score < 70) {
      suggestions.push('Review assignment requirements and ensure all criteria are met');
    }

    if (issues.filter((i) => i.severity === 'high').length > 0) {
      suggestions.push('Address high-severity issues before submitting');
    }

    return {
      isValid: score >= 60 && deadlineStatus !== 'overdue',
      score: Math.max(0, score),
      issues,
      suggestions,
      deadlineStatus,
      formatCheck,
    };
  }

  private buildAnalysisPrompt(data: PortalData): string {
    return `Analyze this student portal data and provide:
1. A brief summary
2. Critical alerts (if any)
3. Actionable recommendations
4. Risk level (low/medium/high)

Data:
${JSON.stringify(data, null, 2)}`;
  }

  private parseAnalysisResponse(content: string): {
    summary: string;
    alerts: string[];
    recommendations: string[];
    riskLevel: 'low' | 'medium' | 'high';
  } {
    // Simple parsing - in production, use structured output
    return {
      summary: content.substring(0, 200),
      alerts: [],
      recommendations: [],
      riskLevel: 'medium',
    };
  }

  private getDefaultAnalysis(data: PortalData): {
    summary: string;
    alerts: string[];
    recommendations: string[];
    riskLevel: 'low' | 'medium' | 'high';
  } {
    const recommendations = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    if (data.attendance && data.attendance.percentage < 75) {
      recommendations.push('Low attendance detected. Take action to improve.');
      riskLevel = 'medium';
    }

    if (data.fees && data.fees.totalDue > 0) {
      recommendations.push('Pending fees detected. Pay soon to avoid issues.');
      riskLevel = riskLevel === 'low' ? 'medium' : 'high';
    }

    return {
      summary: 'Portal data analyzed successfully.',
      alerts: [],
      recommendations,
      riskLevel,
    };
  }
}
