import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PortalConnection } from './portal-connection.entity';
import { User } from '../../users/entities/user.entity';

export enum ActionType {
  LOGIN = 'login',
  SYNC = 'sync',
  VIEW_ATTENDANCE = 'view_attendance',
  SUBMIT_ASSIGNMENT = 'submit_assignment',
  REGISTER_EXAM = 'register_exam',
  DOWNLOAD_HALL_TICKET = 'download_hall_ticket',
  VIEW_NOTICES = 'view_notices',
  VIEW_RESULTS = 'view_results',
  UPDATE_CONNECTION = 'update_connection',
}

export enum ActionStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  PENDING = 'pending',
  CANCELLED = 'cancelled',
}

@Entity('portal_audit_logs')
export class PortalAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => PortalConnection)
  @JoinColumn({ name: 'connection_id' })
  connection: PortalConnection;

  @Column({ name: 'connection_id' })
  connectionId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({
    type: 'enum',
    enum: ActionType,
  })
  actionType: ActionType;

  @Column({
    type: 'enum',
    enum: ActionStatus,
    default: ActionStatus.PENDING,
  })
  status: ActionStatus;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  params: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  result: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'text', nullable: true })
  ipAddress: string;

  @Column({ type: 'text', nullable: true })
  userAgent: string;

  @CreateDateColumn()
  createdAt: Date;
}
