import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PortalsService } from './portals.service';
import { PortalsController } from './portals.controller';
import { PortalsScheduler } from './portals.scheduler';
import { PortalConnection } from './entities/portal-connection.entity';
import { PortalState } from './entities/portal-state.entity';
import { VaultModule } from '../vault/vault.module';
import { AutomationModule } from '../automation/automation.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PortalConnection, PortalState]),
    VaultModule,
    AutomationModule,
    NotificationsModule,
    AiModule,
  ],
  providers: [PortalsService, PortalsScheduler],
  controllers: [PortalsController],
  exports: [PortalsService],
})
export class PortalsModule {}
