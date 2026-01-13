import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { PortalState } from './portal-state.entity';

export enum PortalType {
  AMITY = 'amity',
  DU = 'du',
  VIT = 'vit',
  IIT = 'iit',
  CUSTOM = 'custom',
}

@Entity('portal_connections')
export class PortalConnection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.portalConnections)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({
    type: 'enum',
    enum: PortalType,
  })
  portalType: PortalType;

  @Column()
  portalUrl: string;

  @Column()
  collegeId: string;

  // Encrypted credential reference (not the actual password)
  @Column({ name: 'credential_token' })
  credentialToken: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: true })
  autoSync: boolean;

  @Column({ type: 'int', default: 15 })
  syncIntervalMinutes: number;

  @OneToMany(() => PortalState, (state) => state.connection)
  states: PortalState[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
