import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class BookmarkDto {
  @IsString()
  @IsNotEmpty()
  title: string;
  @IsString()
  @IsNotEmpty()
  link: string;
  @IsString()
  @IsOptional()
  description?: string;
}
