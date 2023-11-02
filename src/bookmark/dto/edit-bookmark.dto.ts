import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EditBookmarkDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  title?: string;
  @ApiProperty()
  @IsString()
  @IsOptional()
  linK?: string;
  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;
}
