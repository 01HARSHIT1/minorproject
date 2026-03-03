import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SupervisorService } from './supervisor.service';
import { SupervisorActionStatus } from './entities/supervisor-action.entity';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Controller('supervisor')
@UseGuards(JwtAuthGuard)
export class SupervisorController {
  constructor(private supervisorService: SupervisorService) {}

  /**
   * Get approval queue (pending actions)
   */
  @Get('actions/pending')
  async getPendingActions(@Request() req) {
    return this.supervisorService.getPendingActions(req.user.userId);
  }

  /**
   * Get all actions, optionally filtered by status
   * Query: ?status=pending|approved|rejected|executed|failed
   */
  @Get('actions')
  async getActions(
    @Request() req,
    @Query('status') status?: SupervisorActionStatus,
  ) {
    return this.supervisorService.getActions(req.user.userId, status);
  }

  /**
   * Get single action
   */
  @Get('actions/:id')
  async getAction(@Param('id') id: string, @Request() req) {
    return this.supervisorService.getAction(id, req.user.userId);
  }

  /**
   * Approve action - user has reviewed and approved.
   * Optionally includes file for immediate upload.
   */
  @Post('actions/:id/approve')
  @UseInterceptors(FileInterceptor('file'))
  async approveAction(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { userEditedContent?: string },
    @UploadedFile() file?: MulterFile,
  ) {
    return this.supervisorService.approveAction(
      id,
      req.user.userId,
      body?.userEditedContent,
      file?.buffer,
      file?.originalname,
    );
  }

  /**
   * Reject action
   */
  @Post('actions/:id/reject')
  async rejectAction(@Param('id') id: string, @Request() req) {
    return this.supervisorService.rejectAction(id, req.user.userId);
  }

  /**
   * Create AI draft suggestion for an assignment (manual trigger)
   */
  @Post('suggest')
  async createSuggestion(
    @Request() req,
    @Body()
    body: {
      portalConnectionId: string;
      assignmentId: string;
      title: string;
      course: string;
      description?: string;
      dueDate: string;
    },
  ) {
    return this.supervisorService.createSubmitSuggestion(
      req.user.userId,
      body.portalConnectionId,
      body.assignmentId,
      {
        title: body.title,
        course: body.course,
        description: body.description,
        dueDate: new Date(body.dueDate),
      },
    );
  }
}
