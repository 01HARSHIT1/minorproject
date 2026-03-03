import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupervisorAction } from './entities/supervisor-action.entity';
import { SupervisorService } from './supervisor.service';
import { SupervisorController } from './supervisor.controller';
import { AgentWorkflowService } from './agent-workflow.service';
import { AiModule } from '../ai/ai.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';
import { PortalsModule } from '../portals/portals.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SupervisorAction]),
    AiModule,
    NotificationsModule,
    UsersModule,
    forwardRef(() => PortalsModule),
  ],
  controllers: [SupervisorController],
  providers: [SupervisorService, AgentWorkflowService],
  exports: [SupervisorService, AgentWorkflowService],
})
export class SupervisorModule {}
