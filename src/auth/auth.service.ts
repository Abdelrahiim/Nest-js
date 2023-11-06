import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon2 from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from './guard/auth.guard';
import { ConfigService } from '@nestjs/config';
import { th } from '@faker-js/faker';
import { Payload, Tokens } from './types';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private readonly configService: ConfigService,
  ) {}
  async login(dto: AuthDto) {
    try {
      const user: User = await this.prisma.user.findUniqueOrThrow({
        where: {
          email: dto.email,
        },
      });
      await this.verifyHashed(
        user.password,
        dto.password,
        'Invalid Credentials',
      );
      const tokens = await this.obtainToken(user.id, user.email);
      await this.updateRefreshToken(user.id, tokens.refresh_token);
      return tokens;
    } catch (e) {
      throw new ForbiddenException('InValid Credentials');
    }
  }

  async signup(dto: AuthDto) {
    const hashedPassword = await this.hashData(dto.password);
    try {
      const user: User = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
        },
      });
      delete user.password;
      const tokens = await this.obtainToken(user.id, user.email);
      await this.updateRefreshToken(user.id, tokens.refresh_token);
      return tokens;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials Taken');
        }
        throw error;
      }
    }
  }

  async logout(userId: number) {
    this.prisma.user.update({
      where: {
        id: userId,
        refreshToken: {
          not: null,
        },
      },
      data: {
        refreshToken: null,
      },
    });
  }
  async refreshToken(refreshToken: string, payload: Payload) {
    try {
      const user = await this.prisma.user.findUniqueOrThrow({
        where: {
          id: payload.sub as number,
          email: payload.email,
        },
      });
      await this.verifyHashed(user.refreshToken, refreshToken, 'Access Denied');
      const tokens = await this.obtainToken(user.id, user.email);
      await this.updateRefreshToken(user.id, tokens.refresh_token);
      return tokens;
    } catch (e) {
      throw new ForbiddenException('Access Denied');
    }
  }

  async updateRefreshToken(userId: number, rt: string) {
    const hashedToken = await this.hashData(rt);
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshToken: hashedToken,
      },
    });
  }

  async verifyHashed(
    hashedValue: string,
    stringValue: string,
    message: string,
  ) {
    const isMatch = await argon2.verify(hashedValue, stringValue);
    if (!isMatch) {
      throw new ForbiddenException(message);
    }
    return isMatch
  }

  /**
   * Return Hashed String With Agron
   * @param data
   */
  async hashData(data: string) {
    return await argon2.hash(data);
  }

  /**
   * Return token
   * @param userId
   * @param email
   */
  async obtainToken(userId: number, email: string): Promise<Tokens> {
    const payload: Payload = { sub: userId, email };
    const secret = this.configService.get('SECRET_KEY');
    const rtSecret = this.configService.get('REFRESH_TOKEN_SECRET_KEY');
    return {
      access_token: await this.jwt.signAsync(payload, {
        expiresIn: '30m',
        secret: secret,
      }),
      refresh_token: await this.jwt.signAsync(payload, {
        expiresIn: '7d',
        secret: rtSecret,
      }),
    };
  }
}
