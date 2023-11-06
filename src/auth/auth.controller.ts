import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { AuthGuard } from './guard/auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { th } from '@faker-js/faker';
import { JwtGuard } from './guard';
import { GetUser } from './decorators';
import { GetUserAndRefreshToken } from './decorators/getRefreshToken.decorator';
import { Payload, PayLoadWithToken } from './types';
import { JwtRtGuard } from './guard/jwt-rt.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * @route POST auth/signup
   */
  @Post('signup')
  async signup(@Body() dto: AuthDto) {
    return await this.authService.signup(dto);
  }

  /**
   * @route POST auth/login
   */
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() dto: AuthDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtGuard)
  @HttpCode(200)
  @Delete('/logout')
  logout(@GetUser('id') userId: number) {
    return this.authService.logout(userId);
  }
  @UseGuards(JwtRtGuard)
  @Get('/refresh')
  refreshToken(@GetUserAndRefreshToken() user: PayLoadWithToken) {
    const payload: Payload = {
      email: user.email,
      sub: user.sub,
    };
    return this.authService.refreshToken(user.refreshToken, payload);
  }
}
