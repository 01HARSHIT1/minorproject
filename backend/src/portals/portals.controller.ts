import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Delete,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PortalsService } from './portals.service';
import { PortalType } from './entities/portal-connection.entity';

@Controller('portals')
@UseGuards(JwtAuthGuard)
export class PortalsController {
  constructor(private portalsService: PortalsService) {}

  @Post('connect')
  async connect(
    @Request() req,
    @Body()
    body: {
      portalType: PortalType;
      portalUrl: string;
      collegeId: string;
      password: string;
    },
  ) {
    return this.portalsService.createConnection(
      req.user.userId,
      body.portalType,
      body.portalUrl,
      body.collegeId,
      body.password,
    );
  }

  @Get()
  async getConnections(@Request() req) {
    return this.portalsService.getUserConnections(req.user.userId);
  }

  @Get(':id')
  async getConnection(@Param('id') id: string, @Request() req) {
    return this.portalsService.getConnection(id, req.user.userId);
  }

  @Post(':id/sync')
  async syncConnection(@Param('id') id: string, @Request() req) {
    return this.portalsService.syncConnection(id, req.user.userId);
  }

  @Get(':id/state')
  async getState(@Param('id') id: string, @Request() req) {
    return this.portalsService.getLatestState(id, req.user.userId);
  }

  @Post(':id/action')
  async performAction(
    @Param('id') id: string,
    @Request() req,
    @Body()
    body: {
      action: string;
      params: Record<string, any>;
    },
  ) {
    return this.portalsService.performAction(
      id,
      req.user.userId,
      body.action,
      body.params,
    );
  }

  @Delete(':id')
  async deleteConnection(@Param('id') id: string, @Request() req) {
    // Soft delete - mark as inactive
    const connection = await this.portalsService.getConnection(id, req.user.userId);
    connection.isActive = false;
    return connection;
  }
}
