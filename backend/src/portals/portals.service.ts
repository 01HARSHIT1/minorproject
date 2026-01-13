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
}
