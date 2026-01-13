import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PortalConnection } from './entities/portal-connection.entity';
import { PortalsService } from './portals.service';

@Injectable()
export class PortalsScheduler {
  private readonly logger = new Logger(PortalsScheduler.name);

  constructor(
    @InjectRepository(PortalConnection)
    private connectionsRepository: Repository<PortalConnection>,
    private portalsService: PortalsService,
  ) {}

  /**
   * Sync all active connections every 15 minutes
   */
  @Cron('0 */15 * * * *') // Every 15 minutes
  async syncAllConnections() {
    this.logger.log('Starting scheduled sync of all portal connections...');

    const connections = await this.connectionsRepository.find({
      where: { isActive: true, autoSync: true },
    });

    for (const connection of connections) {
      try {
        await this.portalsService.syncConnection(connection.id, connection.userId);
        this.logger.log(`Synced connection ${connection.id} for ${connection.collegeId}`);
      } catch (error) {
        this.logger.error(
          `Failed to sync connection ${connection.id}:`,
          error,
        );
      }
    }

    this.logger.log(`Completed sync of ${connections.length} connections`);
  }
}
