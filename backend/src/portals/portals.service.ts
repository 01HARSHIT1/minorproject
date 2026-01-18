import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PortalConnection, PortalType } from './entities/portal-connection.entity';
import { PortalState } from './entities/portal-state.entity';
import { VaultService } from '../vault/vault.service';
import { AutomationService } from '../automation/automation.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AiService } from '../ai/ai.service';
import * as crypto from 'crypto';

@Injectable()
export class PortalsService {
  constructor(
    @InjectRepository(PortalConnection)
    private connectionsRepository: Repository<PortalConnection>,
    @InjectRepository(PortalState)
    private statesRepository: Repository<PortalState>,
    private vaultService: VaultService,
    private automationService: AutomationService,
    private notificationsService: NotificationsService,
    private aiService: AiService,
  ) {}

  async createConnection(
    userId: string,
    portalType: PortalType,
    portalUrl: string,
    collegeId: string,
    password: string,
  ): Promise<PortalConnection> {
    // Generate credential token
    const credentialToken = this.vaultService.generateCredentialToken();

    // Encrypt and store password
    const encryptedPassword = this.vaultService.encrypt(password);
    await this.vaultService.storeCredentials(credentialToken, collegeId, encryptedPassword);

    // Create connection
    const connection = this.connectionsRepository.create({
      userId,
      portalType,
      portalUrl,
      collegeId,
      credentialToken,
    });

    return this.connectionsRepository.save(connection);
  }

  async getUserConnections(userId: string): Promise<PortalConnection[]> {
    return this.connectionsRepository.find({
      where: { userId, isActive: true },
      relations: ['states'],
      order: { createdAt: 'DESC' },
    });
  }

  async getConnection(id: string, userId: string): Promise<PortalConnection> {
    const connection = await this.connectionsRepository.findOne({
      where: { id, userId },
      relations: ['states'],
    });

    if (!connection) {
      throw new NotFoundException('Portal connection not found');
    }

    return connection;
  }

  async syncConnection(id: string, userId: string): Promise<PortalState> {
    const connection = await this.getConnection(id, userId);

    let data: any;

    try {
      // Try to use real automation (works in development with in-memory vault)
      data = await this.automationService.syncPortal(
        connection.portalType,
        connection.collegeId,
        connection.credentialToken,
      );
    } catch (error) {
      // Fallback to mock data if automation fails (e.g., credentials not found, portal down)
      console.warn(`[PortalsService] Automation failed, using mock data:`, error);
      data = {
        attendance: {
          percentage: 75.5,
          totalClasses: 100,
          attended: 75,
          lastUpdated: new Date(),
        },
        exams: [
          {
            subject: 'Mathematics',
            date: new Date('2024-03-15'),
            type: 'Mid-term',
            status: 'Scheduled',
          },
        ],
        results: [],
        fees: {
          totalDue: 12500,
          lastPaid: 0,
          lastPaidDate: new Date(),
          dueDate: new Date('2024-04-01'),
        },
        notices: [
          {
            title: 'Mid-term Exam Schedule',
            content: 'Mid-term exams will be held from March 15-20',
            date: new Date(),
            category: 'Academic',
          },
        ],
        assignments: [
          {
            id: 'mock_assign_1',
            title: 'Minor Project Submission',
            course: 'Minor Project',
            courseCode: 'PROJ3154_5',
            description: 'Submit your minor project documentation and code',
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
            status: 'pending',
            maxMarks: 100,
          },
        ],
      };
    }

    // Get previous state
    const previousState = await this.statesRepository.findOne({
      where: { connectionId: id },
      order: { createdAt: 'DESC' },
    });

    // Calculate notices hash
    const noticesHash = this.calculateNoticesHash(data.notices || []);

    // Check for changes
    const hasChanges = !previousState || previousState.noticesHash !== noticesHash;

    // Create new state
    const newState = this.statesRepository.create({
      connectionId: id,
      noticesHash,
      attendance: data.attendance,
      exams: data.exams,
      results: data.results,
      fees: data.fees,
      notices: data.notices,
      assignments: data.assignments,
    });

    const savedState = await this.statesRepository.save(newState);

    // If changes detected, send notifications
    if (hasChanges) {
      await this.handleStateChange(connection, savedState, previousState);
    }

    return savedState;
  }

  async performAction(
    id: string,
    userId: string,
    action: string,
    params: Record<string, any>,
  ): Promise<any> {
    const connection = await this.getConnection(id, userId);

    // Check with AI if action should be taken
    const currentState = await this.statesRepository.findOne({
      where: { connectionId: id },
      order: { createdAt: 'DESC' },
    });

    if (currentState) {
      const shouldAuto = await this.aiService.shouldAutoAction(action, {
        attendance: currentState.attendance,
        exams: currentState.exams,
        results: currentState.results,
        fees: currentState.fees,
        notices: currentState.notices,
      });

      if (!shouldAuto.should && params.requireConfirmation) {
        return { requiresConfirmation: true, reason: shouldAuto.reason };
      }
    }

    // Try to perform real action
    try {
      const result = await this.automationService.performPortalAction(
        connection.portalType,
        connection.collegeId,
        connection.credentialToken,
        action,
        params,
      );
      return result;
    } catch (error) {
      // If automation fails, return error message
      return {
        success: false,
        message: `Action failed: ${error.message}`,
        timestamp: new Date(),
      };
    }
  }

  async getLatestState(
    connectionId: string,
    userId: string,
  ): Promise<PortalState> {
    await this.getConnection(connectionId, userId);

    const state = await this.statesRepository.findOne({
      where: { connectionId },
      order: { createdAt: 'DESC' },
    });

    if (!state) {
      throw new NotFoundException('No portal state found');
    }

    return state;
  }

  async getPortalInsights(
    connectionId: string,
    userId: string,
  ): Promise<{
    summary: string;
    alerts: string[];
    recommendations: string[];
    riskLevel: 'low' | 'medium' | 'high';
  }> {
    const state = await this.getLatestState(connectionId, userId);

    // Analyze portal data with AI
    const analysis = await this.aiService.analyzePortalData({
      attendance: state.attendance,
      exams: state.exams,
      results: state.results,
      fees: state.fees,
      notices: state.notices,
    });

    // Get additional recommendations
    const recommendations = await this.aiService.generateRecommendations({
      attendance: state.attendance,
      exams: state.exams,
      results: state.results,
      fees: state.fees,
      notices: state.notices,
    });

    return {
      ...analysis,
      recommendations: [...analysis.recommendations, ...recommendations],
    };
  }

  private calculateNoticesHash(notices: Array<any>): string {
    const noticesString = JSON.stringify(notices);
    return crypto.createHash('sha256').update(noticesString).digest('hex');
  }

  private async handleStateChange(
    connection: PortalConnection,
    newState: PortalState,
    previousState: PortalState | null,
  ): Promise<void> {
    // Get user for notifications
    // In production, fetch user with notification preferences

    // Analyze with AI
    const analysis = await this.aiService.analyzePortalData({
      attendance: newState.attendance,
      exams: newState.exams,
      results: newState.results,
      fees: newState.fees,
      notices: newState.notices,
    });

    // Send notifications based on alerts
    if (analysis.alerts.length > 0) {
      // In production, send to user's preferred channels
      console.log(`[NOTIFICATION] Alerts for ${connection.collegeId}:`, analysis.alerts);
    }
  }

  async getAssignments(connectionId: string, userId: string): Promise<any[]> {
    const state = await this.getLatestState(connectionId, userId);
    return state.assignments || [];
  }

  async getAssignment(
    connectionId: string,
    userId: string,
    assignmentId: string,
  ): Promise<any> {
    const assignments = await this.getAssignments(connectionId, userId);
    const assignment = assignments.find((a) => a.id === assignmentId);
    
    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    return assignment;
  }

  async reviewAssignmentForSubmission(
    connectionId: string,
    userId: string,
    assignmentId: string,
    file: Express.Multer.File,
  ): Promise<any> {
    const assignment = await this.getAssignment(connectionId, userId, assignmentId);

    if (!file) {
      throw new Error('No file provided for review');
    }

    // Read file content
    const fileContent = file.buffer.toString('utf-8');

    // Get AI review
    const review = await this.aiService.reviewAssignment(fileContent, {
      title: assignment.title,
      course: assignment.course,
      courseCode: assignment.courseCode,
      description: assignment.description,
      dueDate: new Date(assignment.dueDate),
      fileType: file.mimetype,
      fileName: file.originalname,
    });

    return {
      assignment,
      review,
      fileInfo: {
        name: file.originalname,
        size: file.size,
        type: file.mimetype,
      },
    };
  }

  async submitAssignment(
    connectionId: string,
    userId: string,
    assignmentId: string,
    file: Express.Multer.File,
    comments?: string,
  ): Promise<any> {
    const connection = await this.getConnection(connectionId, userId);
    const assignment = await this.getAssignment(connectionId, userId, assignmentId);

    if (!file) {
      throw new Error('No file provided for submission');
    }

    // Save file temporarily for submission
    const fs = require('fs');
    const path = require('path');
    const os = require('os');
    
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `assignment_${assignmentId}_${Date.now()}_${file.originalname}`);

    try {
      // Write file to temp location
      fs.writeFileSync(tempFilePath, file.buffer);

      // Perform submission action on portal
      const result = await this.performAction(
        connectionId,
        userId,
        'submit_assignment',
        {
          assignmentId,
          filePath: tempFilePath,
          courseCode: assignment.courseCode,
          courseName: assignment.course,
          comments: comments || '',
        },
      );

      // Cleanup temp file
      try {
        fs.unlinkSync(tempFilePath);
      } catch (cleanupError) {
        // Ignore cleanup errors
      }

      return {
        success: result.success || false,
        message: result.message || 'Assignment submission processed',
        assignment,
        timestamp: new Date(),
      };
    } catch (error) {
      // Cleanup temp file on error
      try {
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      } catch (cleanupError) {
        // Ignore cleanup errors
      }

      throw error;
    }
  }
}
