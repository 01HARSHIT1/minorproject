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
