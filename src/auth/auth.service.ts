import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) { }

  async register(dto: RegisterDto) {
    const user = await this.usersService.create(dto);
    const { password, ...result } = user;
    return { message: 'Registration successful', user: result };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByUsername(dto.username);
    if (!user) throw new UnauthorizedException('Invalid username or password');

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid username or password');

    const { password, ...userInfo } = user;
    const tokens = await this.generateTokens(user.id, user.username);
    return { ...tokens, user: userInfo };
  }

  async refresh(refreshToken: string) {
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!tokenRecord) throw new UnauthorizedException('Invalid refresh token');
    if (tokenRecord.expiresAt < new Date()) {
      await this.prisma.refreshToken.delete({ where: { id: tokenRecord.id } });
      throw new UnauthorizedException('Refresh token expired, please log in again');
    }

    await this.prisma.refreshToken.delete({ where: { id: tokenRecord.id } });
    const tokens = await this.generateTokens(tokenRecord.user.id, tokenRecord.user.username);
    return tokens;
  }

  async logout(refreshToken: string) {
    await this.prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    return { message: 'Logged out successfully' };
  }

  async logoutAll(userId: number) {
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
    return { message: 'Logged out from all devices successfully' };
  }

  private async generateTokens(userId: number, username: string) {
    const payload = { sub: userId, username };

    const access_token = this.jwtService.sign(payload);

    const refresh_token = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await this.prisma.refreshToken.create({
      data: { token: refresh_token, userId, expiresAt },
    });

    return { access_token, refresh_token };
  }
}
