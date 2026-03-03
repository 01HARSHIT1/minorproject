import {
  Controller,
  Post,
  Body,
  Patch,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(
    @Body()
    body: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      batch?: number;
    },
  ) {
    return this.authService.register(
      body.email,
      body.password,
      body.firstName,
      body.lastName,
      body.batch,
    );
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateProfile(
    @Request() req,
    @Body() body: { batch?: number; phoneNumber?: string; firstName?: string; lastName?: string },
  ) {
    return this.authService.updateProfile(req.user.userId, body);
  }
}
