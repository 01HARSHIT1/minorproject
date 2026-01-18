import { Injectable } from '@nestjs/common';
import { PortalConnection } from '../entities/portal-connection.entity';

export enum PermissionLevel {
  VIEW_ONLY = 'view_only', // Safe, read-only actions
  MODIFY = 'modify', // Actions that change portal state
  CRITICAL = 'critical', // High-risk actions
}

export interface ActionPermission {
  action: string;
  requiredPermission: PermissionLevel;
  requiresConfirmation: boolean;
  confirmationMessage?: string;
}

@Injectable()
export class ActionConfirmationService {
  private readonly actionPermissions: Map<string, ActionPermission> = new Map([
    ['view_attendance', {
      action: 'view_attendance',
      requiredPermission: PermissionLevel.VIEW_ONLY,
      requiresConfirmation: false,
    }],
    ['view_notices', {
      action: 'view_notices',
      requiredPermission: PermissionLevel.VIEW_ONLY,
      requiresConfirmation: false,
    }],
    ['view_results', {
      action: 'view_results',
      requiredPermission: PermissionLevel.VIEW_ONLY,
      requiresConfirmation: false,
    }],
    ['sync', {
      action: 'sync',
      requiredPermission: PermissionLevel.VIEW_ONLY,
      requiresConfirmation: false,
    }],
    ['submit_assignment', {
      action: 'submit_assignment',
      requiredPermission: PermissionLevel.MODIFY,
      requiresConfirmation: true,
      confirmationMessage: 'Are you sure you want to submit this assignment? This action cannot be undone.',
    }],
    ['register_exam', {
      action: 'register_exam',
      requiredPermission: PermissionLevel.MODIFY,
      requiresConfirmation: true,
      confirmationMessage: 'Are you sure you want to register for this exam?',
    }],
    ['download_hall_ticket', {
      action: 'download_hall_ticket',
      requiredPermission: PermissionLevel.VIEW_ONLY,
      requiresConfirmation: false,
    }],
    ['delete_connection', {
      action: 'delete_connection',
      requiredPermission: PermissionLevel.CRITICAL,
      requiresConfirmation: true,
      confirmationMessage: 'Are you sure you want to disconnect this portal? All sync data will be lost.',
    }],
  ]);

  /**
   * Check if action requires confirmation
   */
  requiresConfirmation(action: string): boolean {
    const permission = this.actionPermissions.get(action);
    return permission?.requiresConfirmation || false;
  }

  /**
   * Get confirmation message for action
   */
  getConfirmationMessage(action: string): string | null {
    const permission = this.actionPermissions.get(action);
    return permission?.confirmationMessage || null;
  }

  /**
   * Check if user has permission for action
   */
  hasPermission(action: string, connection: PortalConnection): boolean {
    // For now, all authenticated users with active connections have permissions
    // This can be enhanced with role-based permissions later
    if (!connection.isActive) {
      return false;
    }

    const permission = this.actionPermissions.get(action);
    if (!permission) {
      // Unknown actions require explicit permission check
      return false;
    }

    return true;
  }

  /**
   * Get required permission level for action
   */
  getRequiredPermission(action: string): PermissionLevel | null {
    const permission = this.actionPermissions.get(action);
    return permission?.requiredPermission || null;
  }
}
