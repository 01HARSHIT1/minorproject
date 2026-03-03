import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupervisorAction, SupervisorActionStatus, SupervisorActionType } from './entities/supervisor-action.entity';
import { AiService } from '../ai/ai.service';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';

export interface AssignmentContext {
  id: string;
  title: string;
  course: string;
  courseCode: string;
  description?: string;
  dueDate: Date;
  status: string;
  maxMarks?: number;
}

export interface NewAssignmentEvent {
  connectionId: string;
  connectionType: string;
  userId: string;
  userBatch: number | null;
  assignment: AssignmentContext;
}

@Injectable()
export class AgentWorkflowService {
  private readonly logger = new Logger(AgentWorkflowService.name);

  constructor(
    @InjectRepository(SupervisorAction)
    private supervisorActionRepository: Repository<SupervisorAction>,
    private aiService: AiService,
    private notificationsService: NotificationsService,
    private usersService: UsersService,
  ) {}

  /**
   * Triggered when a new assignment is detected during portal sync.
   * Creates a pending SupervisorAction and notifies the user.
   */
  async onNewAssignmentDetected(event: NewAssignmentEvent): Promise<SupervisorAction | null> {
    // Filter by batch if user has batch set
    if (event.userBatch != null && event.assignment) {
      const assignmentBatch = (event.assignment as any).batch;
      if (assignmentBatch != null && assignmentBatch !== event.userBatch) {
        this.logger.log(
          `Skipping assignment ${event.assignment.id} - batch ${assignmentBatch} does not match user batch ${event.userBatch}`,
        );
        return null;
      }
    }

    const dueDate = new Date(event.assignment.dueDate);
    const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    // AI analysis: summarize assignment, suggest approach, estimate effort
    let aiSummary = '';
    let aiSuggestedDraft: string | null = null;

    try {
      const analysis = await this.analyzeAssignmentForSupervisor(event.assignment);
      aiSummary = analysis.summary;
      aiSuggestedDraft = analysis.suggestedApproach;
    } catch (error) {
      this.logger.warn('AI analysis failed for new assignment:', error);
      aiSummary = `New assignment: ${event.assignment.title} (${event.assignment.course}). Due in ${daysUntilDue} days.`;
    }

    // Create pending SupervisorAction - user must approve before any upload
    const action = this.supervisorActionRepository.create({
      userId: event.userId,
      portalConnectionId: event.connectionId,
      actionType: SupervisorActionType.AI_DRAFT_SUGGESTION,
      payload: {
        assignmentId: event.assignment.id,
        assignmentTitle: event.assignment.title,
        course: event.assignment.course,
        courseCode: event.assignment.courseCode,
        dueDate: event.assignment.dueDate,
        daysUntilDue,
      },
      status: SupervisorActionStatus.PENDING,
      aiSummary,
      aiSuggestedDraft,
    });

    const saved = await this.supervisorActionRepository.save(action);

    // Notify user
    const user = await this.usersService.findById(event.userId);
    if (user) {
      try {
        await this.notificationsService.sendNotification(
          ['email'],
          { email: user.email, phoneNumber: user.phoneNumber },
          `🆕 New Assignment (Batch ${event.userBatch ?? 'All'} – ${event.assignment.course})`,
          `"${event.assignment.title}" – Due in ${daysUntilDue} days.\n\nWant AI help drafting? Visit your dashboard to review and approve.`,
          {
            type: 'new_assignment_supervisor',
            actionId: saved.id,
            connectionId: event.connectionId,
            assignmentId: event.assignment.id,
          },
        );
      } catch (err) {
        this.logger.error('Failed to send new assignment notification:', err);
      }
    }

    this.logger.log(`[Supervisor] Created pending action ${saved.id} for assignment ${event.assignment.id}`);
    return saved;
  }

  /**
   * AI analyzes assignment and returns summary + suggested approach.
   * Never accesses credentials or performs actions.
   */
  async analyzeAssignmentForSupervisor(
    assignment: AssignmentContext,
  ): Promise<{ summary: string; suggestedApproach: string }> {
    const prompt = `As an AI Academic Supervisor Assistant, analyze this assignment and provide:
1. A brief summary (2-3 sentences)
2. Suggested approach/steps to complete it
3. Estimated effort (e.g., "1-2 hours", "Medium complexity")

Assignment:
Title: ${assignment.title}
Course: ${assignment.course}
Description: ${assignment.description || 'No description'}
Due: ${new Date(assignment.dueDate).toLocaleDateString()}
Max Marks: ${assignment.maxMarks ?? 'N/A'}

Respond in JSON format:
{"summary": "...", "suggestedApproach": "...", "estimatedEffort": "..."}`;

    const result = await this.aiService.chat(prompt, { assignment });
    const response = result.response;

    // Try to extract JSON from response
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          summary: parsed.summary || response.substring(0, 300),
          suggestedApproach: parsed.suggestedApproach || '',
        };
      }
    } catch {
      // Fallback
    }

    return {
      summary: response.substring(0, 300),
      suggestedApproach: response,
    };
  }

  /**
   * Get pending actions for a user (approval queue)
   */
  async getPendingActions(userId: string): Promise<SupervisorAction[]> {
    return this.supervisorActionRepository.find({
      where: { userId, status: SupervisorActionStatus.PENDING },
      relations: ['portalConnection'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Approve an action - only then will automation execute
   */
  async approveAction(
    actionId: string,
    userId: string,
    userEditedContent?: string,
  ): Promise<SupervisorAction> {
    const action = await this.supervisorActionRepository.findOne({
      where: { id: actionId, userId },
    });

    if (!action) {
      throw new Error('Supervisor action not found');
    }

    if (action.status !== SupervisorActionStatus.PENDING) {
      throw new Error(`Action already ${action.status}`);
    }

    action.status = SupervisorActionStatus.APPROVED;
    if (userEditedContent) {
      action.userEditedContent = userEditedContent;
    }
    return this.supervisorActionRepository.save(action);
  }

  /**
   * Reject an action - no execution
   */
  async rejectAction(actionId: string, userId: string): Promise<SupervisorAction> {
    const action = await this.supervisorActionRepository.findOne({
      where: { id: actionId, userId },
    });

    if (!action) {
      throw new Error('Supervisor action not found');
    }

    if (action.status !== SupervisorActionStatus.PENDING) {
      throw new Error(`Action already ${action.status}`);
    }

    action.status = SupervisorActionStatus.REJECTED;
    return this.supervisorActionRepository.save(action);
  }
}
