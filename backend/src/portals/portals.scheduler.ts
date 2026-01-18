import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PortalConnection } from './entities/portal-connection.entity';
import { PortalState } from './entities/portal-state.entity';
import { PortalsService } from './portals.service';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class PortalsScheduler {
  private readonly logger = new Logger(PortalsScheduler.name);
  private readonly sentRemindersCache = new Map<string, Set<string>>(); // connectionId -> Set<assignmentId>

  constructor(
    @InjectRepository(PortalConnection)
    private connectionsRepository: Repository<PortalConnection>,
    @InjectRepository(PortalState)
    private statesRepository: Repository<PortalState>,
    private portalsService: PortalsService,
    private notificationsService: NotificationsService,
    private usersService: UsersService,
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

  /**
   * Check assignment deadlines and send reminders
   * Runs every 6 hours (at 8 AM and 2 PM daily)
   */
  @Cron('0 8,14 * * *') // 8 AM and 2 PM daily
  async checkAssignmentDeadlines() {
    this.logger.log('Starting assignment deadline reminder check...');

    const connections = await this.connectionsRepository.find({
      where: { isActive: true, autoSync: true },
    });

    const now = new Date();
    let remindersSent = 0;

    for (const connection of connections) {
      try {
        // Get latest portal state
        const latestState = await this.statesRepository.findOne({
          where: { connectionId: connection.id },
          order: { createdAt: 'DESC' },
        });

        if (!latestState || !latestState.assignments || latestState.assignments.length === 0) {
          continue;
        }

        // Get user for notification preferences
        const user = await this.usersService.findById(connection.userId);
        if (!user) {
          continue;
        }

        // Initialize cache for this connection if needed
        if (!this.sentRemindersCache.has(connection.id)) {
          this.sentRemindersCache.set(connection.id, new Set());
        }
        const sentReminders = this.sentRemindersCache.get(connection.id)!;

        // Check each assignment
        for (const assignment of latestState.assignments) {
          // Skip if already submitted or graded
          if (assignment.status === 'submitted' || assignment.status === 'graded') {
            sentReminders.delete(assignment.id); // Clear from cache if submitted
            continue;
          }

          // Handle both Date objects and date strings from JSONB
          const dueDate = assignment.dueDate instanceof Date 
            ? assignment.dueDate 
            : new Date(assignment.dueDate);
          const timeUntilDue = dueDate.getTime() - now.getTime();
          const hoursUntilDue = timeUntilDue / (1000 * 60 * 60);
          const daysUntilDue = Math.ceil(hoursUntilDue / 24);

          // Determine reminder thresholds
          const reminderKey = `${assignment.id}`;
          let shouldRemind = false;
          let reminderMessage = '';

          // 7 days before
          if (daysUntilDue === 7 && !sentReminders.has(`${reminderKey}_7d`)) {
            shouldRemind = true;
            reminderMessage = `📝 Assignment "${assignment.title}" is due in 7 days. Time to start working on it!`;
            sentReminders.add(`${reminderKey}_7d`);
          }
          // 3 days before
          else if (daysUntilDue === 3 && !sentReminders.has(`${reminderKey}_3d`)) {
            shouldRemind = true;
            reminderMessage = `⏰ Assignment "${assignment.title}" is due in 3 days. Don't wait until the last minute!`;
            sentReminders.add(`${reminderKey}_3d`);
          }
          // 1 day before
          else if (daysUntilDue === 1 && !sentReminders.has(`${reminderKey}_1d`)) {
            shouldRemind = true;
            reminderMessage = `🚨 URGENT: Assignment "${assignment.title}" is due tomorrow! Submit it soon.`;
            sentReminders.add(`${reminderKey}_1d`);
          }
          // 6 hours before
          else if (hoursUntilDue > 0 && hoursUntilDue <= 6 && !sentReminders.has(`${reminderKey}_6h`)) {
            shouldRemind = true;
            reminderMessage = `⚡ FINAL REMINDER: Assignment "${assignment.title}" is due in ${Math.ceil(hoursUntilDue)} hour(s)! Submit immediately.`;
            sentReminders.add(`${reminderKey}_6h`);
          }
          // Overdue
          else if (hoursUntilDue < 0 && !sentReminders.has(`${reminderKey}_overdue`)) {
            shouldRemind = true;
            const hoursOverdue = Math.abs(Math.ceil(hoursUntilDue));
            reminderMessage = `❌ OVERDUE: Assignment "${assignment.title}" was due ${hoursOverdue} hour(s) ago. Contact your instructor.`;
            sentReminders.add(`${reminderKey}_overdue`);
          }

          if (shouldRemind) {
            // Send notification via email (most reliable for reminders)
            const channels: Array<'push' | 'whatsapp' | 'sms' | 'email'> = ['email'];
            if (user.phoneNumber) {
              channels.push('sms'); // Also send SMS if phone number available
            }

            try {
              await this.notificationsService.sendNotification(
                channels,
                {
                  email: user.email,
                  phoneNumber: user.phoneNumber,
                },
                'Assignment Deadline Reminder',
                reminderMessage,
                {
                  type: 'assignment_reminder',
                  assignmentId: assignment.id,
                  connectionId: connection.id,
                  dueDate: (assignment.dueDate instanceof Date 
                    ? assignment.dueDate 
                    : new Date(assignment.dueDate)).toISOString(),
                },
              );

              remindersSent++;
              this.logger.log(
                `Reminder sent to ${connection.collegeId} for assignment: ${assignment.title}`,
              );
            } catch (error) {
              this.logger.error(
                `Failed to send reminder for ${connection.collegeId}:`,
                error,
              );
            }
          }

          // Clean up old cache entries (older than 30 days)
          // This prevents memory leaks from cache growing indefinitely
          if (hoursUntilDue < -720) {
            // 30 days ago
            sentReminders.delete(`${reminderKey}_7d`);
            sentReminders.delete(`${reminderKey}_3d`);
            sentReminders.delete(`${reminderKey}_1d`);
            sentReminders.delete(`${reminderKey}_6h`);
            sentReminders.delete(`${reminderKey}_overdue`);
          }
        }
      } catch (error) {
        this.logger.error(`Failed to check deadlines for connection ${connection.id}:`, error);
      }
    }

    this.logger.log(`Assignment deadline check completed. Sent ${remindersSent} reminders.`);
  }
}
