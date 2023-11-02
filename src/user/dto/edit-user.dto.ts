import { IsEmail, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EditUserDto {
  @ApiProperty()
  @IsEmail()
  @IsOptional()
  email?: string;
  @ApiProperty()
  @IsString()
  @IsOptional()
  firstName?: string;
  @ApiProperty()
  @IsString()
  @IsOptional()
  lastName?: string;
}
