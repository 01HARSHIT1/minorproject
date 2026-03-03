import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PortalsService } from './portals.service';
import { PortalsController } from './portals.controller';
import { PortalsScheduler } from './portals.scheduler';
import { PortalConnection } from './entities/portal-connection.entity';
import { PortalState } from './entities/portal-state.entity';
import { PortalAuditLog } from './entities/portal-audit-log.entity';
import { ActionConfirmationService } from './services/action-confirmation.service';
import { VaultModule } from '../vault/vault.module';
import { AutomationModule } from '../automation/automation.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AiModule } from '../ai/ai.module';
import { UsersModule } from '../users/users.module';
import { SupervisorModule } from '../supervisor/supervisor.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PortalConnection, PortalState, PortalAuditLog]),
    VaultModule,
    AutomationModule,
    NotificationsModule,
    AiModule,
    UsersModule,
    forwardRef(() => SupervisorModule),
  ],
  providers: [PortalsService, PortalsScheduler, ActionConfirmationService],
  controllers: [PortalsController],
  exports: [PortalsService],
})
export class PortalsModule {}
