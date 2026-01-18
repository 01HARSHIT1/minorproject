import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Delete,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PortalsService } from './portals.service';
import { PortalType } from './entities/portal-connection.entity';

// File type for multer uploads
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
  destination?: string;
  filename?: string;
  path?: string;
}

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

  @Get('summary')
  async getDashboardSummary(@Request() req) {
    return this.portalsService.getDashboardSummary(req.user.userId);
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

  @Get(':id/insights')
  async getInsights(@Param('id') id: string, @Request() req) {
    return this.portalsService.getPortalInsights(id, req.user.userId);
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

  @Get(':id/assignments')
  async getAssignments(@Param('id') id: string, @Request() req) {
    return this.portalsService.getAssignments(id, req.user.userId);
  }

  @Get(':id/assignments/:assignmentId')
  async getAssignment(
    @Param('id') id: string,
    @Param('assignmentId') assignmentId: string,
    @Request() req,
  ) {
    return this.portalsService.getAssignment(id, req.user.userId, assignmentId);
  }

  @Post(':id/assignments/:assignmentId/review')
  @UseInterceptors(FileInterceptor('file'))
  async reviewAssignment(
    @Param('id') id: string,
    @Param('assignmentId') assignmentId: string,
    @Request() req,
    @UploadedFile() file: MulterFile | undefined,
  ) {
    return this.portalsService.reviewAssignmentForSubmission(
      id,
      req.user.userId,
      assignmentId,
      file,
    );
  }

  @Post(':id/assignments/:assignmentId/submit')
  @UseInterceptors(FileInterceptor('file'))
  async submitAssignment(
    @Param('id') id: string,
    @Param('assignmentId') assignmentId: string,
    @Request() req,
    @Body() body: { comments?: string },
    @UploadedFile() file: MulterFile | undefined,
  ) {
    return this.portalsService.submitAssignment(
      id,
      req.user.userId,
      assignmentId,
      file,
      body.comments,
    );
  }
}
