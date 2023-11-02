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

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private readonly configService: ConfigService,
  ) {}
  async login(dto: AuthDto) {
    const user: User = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!user) {
      throw new ForbiddenException('InValid Credentials');
    }
    const passwordMatch = await argon2.verify(user.password, dto.password);
    if (!passwordMatch) {
      throw new ForbiddenException('InValid Credentials');
    }
    return {
      access_token: await this.obtainToken(user.id, user.email),
    };
  }
  async obtainToken(userId: number, email: string) {
    const payload = { sub: userId, email };
    const secret = this.configService.get('SECRET_KEY');
    return await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: secret,
    });
  }

  async signup(dto: AuthDto) {
    const hashedPassword = await argon2.hash(dto.password);
    try {
      const user: User = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
        },
      });
      delete user.password;
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials Taken');
        }
        throw error;
      }
    }
  }
}
