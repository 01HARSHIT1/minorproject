import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { PortalConnection } from '../../portals/entities/portal-connection.entity';

export enum SupervisorActionType {
  SUBMIT_ASSIGNMENT = 'submit_assignment',
  AI_DRAFT_SUGGESTION = 'ai_draft_suggestion',
  REVIEW_ASSIGNMENT = 'review_assignment',
  CUSTOM_ACTION = 'custom_action',
}

export enum SupervisorActionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXECUTED = 'executed',
  FAILED = 'failed',
}

@Entity('supervisor_actions')
export class SupervisorAction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'portal_connection_id' })
  portalConnectionId: string;

  @ManyToOne(() => PortalConnection)
  @JoinColumn({ name: 'portal_connection_id' })
  portalConnection: PortalConnection;

  @Column({
    type: 'enum',
    enum: SupervisorActionType,
  })
  actionType: SupervisorActionType;

  /** JSON payload: assignmentId, suggestedDraft, params, etc. */
  @Column({ type: 'jsonb' })
  payload: Record<string, any>;

  @Column({
    type: 'enum',
    enum: SupervisorActionStatus,
    default: SupervisorActionStatus.PENDING,
  })
  status: SupervisorActionStatus;

  /** AI summary/explanation shown to user before approval */
  @Column({ type: 'text', nullable: true })
  aiSummary: string;

  /** AI suggested approach or draft content (for submission) */
  @Column({ type: 'text', nullable: true })
  aiSuggestedDraft: string | null;

  /** User's edited content before approval (if any) */
  @Column({ type: 'text', nullable: true })
  userEditedContent: string | null;

  /** Result after execution (screenshot base64, success message, etc.) */
  @Column({ type: 'jsonb', nullable: true })
  executionResult: Record<string, any> | null;

  /** Error message if failed */
  @Column({ type: 'text', nullable: true })
  errorMessage: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
