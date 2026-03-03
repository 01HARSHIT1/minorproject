import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { PortalConnection } from '../../portals/entities/portal-connection.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  phoneNumber: string;

  /** Batch number for filtering portal content (e.g., Batch 7) */
  @Column({ type: 'int', nullable: true })
  batch: number | null;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => PortalConnection, (connection) => connection.user)
  portalConnections: PortalConnection[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
