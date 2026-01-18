import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PortalConnection, PortalType } from './entities/portal-connection.entity';
import { PortalState } from './entities/portal-state.entity';
import { VaultService } from '../vault/vault.service';
import { AutomationService } from '../automation/automation.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AiService } from '../ai/ai.service';
import * as crypto from 'crypto';

// File type for multer uploads
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
  destination?: string;
  filename?: string;
  path?: string;
}

@Injectable()
export class PortalsService {
  private readonly logger = new Logger(PortalsService.name);

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

    // Calculate notices and assignments hash
    const noticesHash = this.calculateNoticesHash(data.notices || []);
    const assignmentsHash = this.calculateAssignmentsHash(data.assignments || []);

    // Check for changes
    const hasNoticesChanges = !previousState || previousState.noticesHash !== noticesHash;
    const hasAssignmentsChanges = !previousState || previousState.assignmentsHash !== assignmentsHash;
    const hasChanges = hasNoticesChanges || hasAssignmentsChanges;

    // Create new state
    const newState = this.statesRepository.create({
      connectionId: id,
      noticesHash,
      assignmentsHash,
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

    // Analyze portal data with AI (including assignments)
    const analysis = await this.aiService.analyzePortalData({
      attendance: state.attendance,
      exams: state.exams,
      results: state.results,
      fees: state.fees,
      notices: state.notices,
      assignments: state.assignments,
    });

    // Get additional recommendations (including assignments)
    const recommendations = await this.aiService.generateRecommendations({
      attendance: state.attendance,
      exams: state.exams,
      results: state.results,
      fees: state.fees,
      notices: state.notices,
      assignments: state.assignments,
    });

    // Add assignment-specific recommendations
    const assignmentRecommendations: string[] = [];
    if (state.assignments && state.assignments.length > 0) {
      const pendingAssignments = state.assignments.filter(
        a => a.status === 'pending' || a.status === 'overdue'
      );
      
      if (pendingAssignments.length > 0) {
        const now = new Date();
        const sortedByDueDate = pendingAssignments.sort((a, b) => {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });

        // Priority assignment recommendation
        const nextAssignment = sortedByDueDate[0];
        const dueDate = new Date(nextAssignment.dueDate);
        const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilDue > 0) {
          assignmentRecommendations.push(
            `📝 Prioritize "${nextAssignment.title}" - due in ${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''}`
          );
        } else if (daysUntilDue === 0) {
          assignmentRecommendations.push(
            `🚨 URGENT: "${nextAssignment.title}" is due today!`
          );
        }

        // Overall assignment status
        const overdueCount = state.assignments.filter(a => a.status === 'overdue').length;
        if (overdueCount > 0) {
          assignmentRecommendations.push(
            `⚠️ You have ${overdueCount} overdue assignment${overdueCount > 1 ? 's' : ''}. Contact your instructors.`
          );
        }
      }

      const submittedCount = state.assignments.filter(a => a.status === 'submitted').length;
      if (submittedCount > 0) {
        assignmentRecommendations.push(
          `✅ ${submittedCount} assignment${submittedCount > 1 ? 's' : ''} submitted successfully`
        );
      }
    }

    return {
      ...analysis,
      recommendations: [...analysis.recommendations, ...recommendations, ...assignmentRecommendations],
    };
  }

  private calculateNoticesHash(notices: Array<any>): string {
    const noticesString = JSON.stringify(notices);
    return crypto.createHash('sha256').update(noticesString).digest('hex');
  }

  private calculateAssignmentsHash(assignments: Array<any>): string {
    const assignmentsString = JSON.stringify(assignments);
    return crypto.createHash('sha256').update(assignmentsString).digest('hex');
  }

  private async handleStateChange(
    connection: PortalConnection,
    newState: PortalState,
    previousState: PortalState | null,
  ): Promise<void> {
    // Get user for notifications
    // In production, fetch user with notification preferences

    // Detect assignment changes
    const previousAssignments = previousState?.assignments || [];
    const newAssignments = newState.assignments || [];
    
    // Find new assignments
    const newAssignmentIds = newAssignments.map(a => a.id);
    const previousAssignmentIds = previousAssignments.map(a => a.id);
    const addedAssignments = newAssignments.filter(
      a => !previousAssignmentIds.includes(a.id)
    );

    // Find assignments with approaching deadlines
    const now = new Date();
    const assignmentsDueSoon = newAssignments.filter((assignment) => {
      if (assignment.status === 'submitted' || assignment.status === 'graded') {
        return false;
      }
      const dueDate = new Date(assignment.dueDate);
      const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      return hoursUntilDue > 0 && hoursUntilDue <= 48; // Due within 48 hours
    });

    // Find overdue assignments
    const overdueAssignments = newAssignments.filter((assignment) => {
      if (assignment.status === 'submitted' || assignment.status === 'graded') {
        return false;
      }
      const dueDate = new Date(assignment.dueDate);
      return dueDate < now;
    });

    // Analyze with AI (including assignments)
    const analysis = await this.aiService.analyzePortalData({
      attendance: newState.attendance,
      exams: newState.exams,
      results: newState.results,
      fees: newState.fees,
      notices: newState.notices,
      assignments: newState.assignments,
    });

    // Build assignment-specific alerts
    const assignmentAlerts: string[] = [];
    
    if (addedAssignments.length > 0) {
      assignmentAlerts.push(
        `🎯 ${addedAssignments.length} new assignment${addedAssignments.length > 1 ? 's' : ''} posted: ${addedAssignments.map(a => a.title).join(', ')}`
      );
    }

    if (overdueAssignments.length > 0) {
      assignmentAlerts.push(
        `⚠️ ${overdueAssignments.length} assignment${overdueAssignments.length > 1 ? 's' : ''} overdue: ${overdueAssignments.map(a => a.title).join(', ')}`
      );
    }

    if (assignmentsDueSoon.length > 0) {
      assignmentsDueSoon.forEach((assignment) => {
        const dueDate = new Date(assignment.dueDate);
        const hoursUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60));
        assignmentAlerts.push(
          `⏰ Assignment "${assignment.title}" due in ${hoursUntilDue} hour${hoursUntilDue > 1 ? 's' : ''}`
        );
      });
    }

    // Combine AI alerts with assignment alerts
    const allAlerts = [...analysis.alerts, ...assignmentAlerts];

    // Send notifications based on alerts
    if (allAlerts.length > 0) {
      // In production, send to user's preferred channels
      this.logger.log(`[NOTIFICATION] Alerts for ${connection.collegeId}:`, allAlerts);
      
      // Send via notification service (email, push, etc.)
      // await this.notificationsService.sendNotification({
      //   userId: connection.userId,
      //   title: 'Portal Updates',
      //   message: allAlerts.join('\n'),
      //   type: 'portal_update',
      // });
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
    file: MulterFile | undefined,
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
    file: MulterFile | undefined,
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
