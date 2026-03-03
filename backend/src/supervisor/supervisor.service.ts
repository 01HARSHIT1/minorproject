import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  SupervisorAction,
  SupervisorActionStatus,
  SupervisorActionType,
} from './entities/supervisor-action.entity';
import { AgentWorkflowService } from './agent-workflow.service';
import { PortalsService } from '../portals/portals.service';

@Injectable()
export class SupervisorService {
  private readonly logger = new Logger(SupervisorService.name);

  constructor(
    @InjectRepository(SupervisorAction)
    private supervisorActionRepository: Repository<SupervisorAction>,
    private agentWorkflowService: AgentWorkflowService,
    private portalsService: PortalsService,
  ) {}

  /**
   * Get all supervisor actions for user (approval queue + history)
   */
  async getActions(
    userId: string,
    status?: SupervisorActionStatus,
  ): Promise<SupervisorAction[]> {
    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    return this.supervisorActionRepository.find({
      where,
      relations: ['portalConnection'],
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  /**
   * Get pending actions (approval queue)
   */
  async getPendingActions(userId: string): Promise<SupervisorAction[]> {
    return this.agentWorkflowService.getPendingActions(userId);
  }

  /**
   * Get single action by ID
   */
  async getAction(actionId: string, userId: string): Promise<SupervisorAction> {
    const action = await this.supervisorActionRepository.findOne({
      where: { id: actionId, userId },
      relations: ['portalConnection'],
    });

    if (!action) {
      throw new NotFoundException('Supervisor action not found');
    }

    return action;
  }

  /**
   * Approve action - user has reviewed and approved.
   * For submit_assignment / ai_draft_suggestion: we execute the upload via automation.
   */
  async approveAction(
    actionId: string,
    userId: string,
    userEditedContent?: string,
    fileBuffer?: Buffer,
    fileName?: string,
  ): Promise<{ success: boolean; message: string; action?: SupervisorAction }> {
    const action = await this.getAction(actionId, userId);

    if (action.status !== SupervisorActionStatus.PENDING) {
      return {
        success: false,
        message: `Action already ${action.status}`,
      };
    }

    await this.agentWorkflowService.approveAction(
      actionId,
      userId,
      userEditedContent,
    );

    const updatedAction = await this.getAction(actionId, userId);

    // If this is a submit action and we have file + approval, execute upload
    if (
      (action.actionType === SupervisorActionType.SUBMIT_ASSIGNMENT ||
        action.actionType === SupervisorActionType.AI_DRAFT_SUGGESTION) &&
      action.payload?.assignmentId &&
      fileBuffer &&
      fileName
    ) {
      return this.executeApprovedUpload(
        updatedAction,
        userId,
        fileBuffer,
        fileName,
      );
    }

    return {
      success: true,
      message: 'Action approved. Upload when ready via the portal.',
      action: updatedAction,
    };
  }

  /**
   * Execute the actual upload - ONLY after user approval.
   * Uses vault + automation. AI never touches credentials.
   */
  private async executeApprovedUpload(
    action: SupervisorAction,
    userId: string,
    fileBuffer: Buffer,
    fileName: string,
  ): Promise<{ success: boolean; message: string; action?: SupervisorAction }> {
    const connection = await this.portalsService.getConnection(
      action.portalConnectionId,
      userId,
    );

    const fs = require('fs');
    const path = require('path');
    const os = require('os');

    const tempDir = os.tmpdir();
    const tempFilePath = path.join(
      tempDir,
      `supervisor_${action.id}_${Date.now()}_${fileName}`,
    );

    try {
      fs.writeFileSync(tempFilePath, fileBuffer);

      const result = await this.portalsService.submitAssignment(
        action.portalConnectionId,
        userId,
        action.payload.assignmentId,
        {
          buffer: fileBuffer,
          originalname: fileName,
          mimetype: 'application/octet-stream',
          size: fileBuffer.length,
        } as any,
        action.userEditedContent || undefined,
        true, // confirmed - user already approved
      );

      action.status = SupervisorActionStatus.EXECUTED;
      action.executionResult = {
        success: true,
        message: 'Assignment submitted successfully',
        timestamp: new Date(),
      };
      await this.supervisorActionRepository.save(action);

      return {
        success: true,
        message: 'Assignment submitted successfully!',
        action,
      };
    } catch (error) {
      this.logger.error('Supervisor upload execution failed:', error);

      action.status = SupervisorActionStatus.FAILED;
      action.errorMessage = error.message;
      await this.supervisorActionRepository.save(action);

      return {
        success: false,
        message: `Upload failed: ${error.message}`,
        action,
      };
    } finally {
      try {
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      } catch {
        // ignore cleanup errors
      }
    }
  }

  /**
   * Reject action - user does not want to proceed
   */
  async rejectAction(actionId: string, userId: string): Promise<SupervisorAction> {
    return this.agentWorkflowService.rejectAction(actionId, userId);
  }

  /**
   * Create a submit_assignment action (e.g., from "Want AI help?" flow)
   */
  async createSubmitSuggestion(
    userId: string,
    portalConnectionId: string,
    assignmentId: string,
    assignmentDetails: { title: string; course: string; description?: string; dueDate: Date },
  ): Promise<SupervisorAction> {
    const analysis = await this.agentWorkflowService.analyzeAssignmentForSupervisor(
      assignmentDetails as any,
    );

    const action = this.supervisorActionRepository.create({
      userId,
      portalConnectionId,
      actionType: SupervisorActionType.SUBMIT_ASSIGNMENT,
      payload: {
        assignmentId,
        ...assignmentDetails,
      },
      status: SupervisorActionStatus.PENDING,
      aiSummary: analysis.summary,
      aiSuggestedDraft: analysis.suggestedApproach,
    });

    return this.supervisorActionRepository.save(action);
  }
}
