import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user, // validateUser already strips passwordHash
    };
  }

  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    batch?: number,
  ) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.usersService.create({
      email,
      passwordHash: hashedPassword,
      firstName,
      lastName,
      ...(batch != null && { batch }),
    });

    return this.login(user);
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const { passwordHash, ...profile } = user;
    return profile;
  }

  async updateProfile(userId: string, updates: { batch?: number; phoneNumber?: string; firstName?: string; lastName?: string }) {
    const user = await this.usersService.update(userId, updates);
    if (!user) return null;
    const { passwordHash, ...profile } = user;
    return profile;
  }
}
