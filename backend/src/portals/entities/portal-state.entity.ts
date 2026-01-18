import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PortalConnection } from './portal-connection.entity';

@Entity('portal_states')
export class PortalState {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => PortalConnection, (connection) => connection.states)
  @JoinColumn({ name: 'connection_id' })
  connection: PortalConnection;

  @Column({ name: 'connection_id' })
  connectionId: string;

  // Hash of notices to detect changes
  @Column({ type: 'text', nullable: true })
  noticesHash: string;

  // Structured data
  @Column({ type: 'jsonb', nullable: true })
  attendance: {
    percentage: number;
    totalClasses: number;
    attended: number;
    lastUpdated: Date;
  };

  @Column({ type: 'jsonb', nullable: true })
  exams: Array<{
    subject: string;
    date: Date;
    type: string;
    status: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  results: Array<{
    subject: string;
    marks: number;
    grade: string;
    semester: string;
    date: Date;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  fees: {
    totalDue: number;
    lastPaid: number;
    lastPaidDate: Date;
    dueDate: Date;
  };

  @Column({ type: 'jsonb', nullable: true })
  notices: Array<{
    title: string;
    content: string;
    date: Date;
    category: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  assignments: Array<{
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
  }>;

  @CreateDateColumn()
  createdAt: Date;
}
