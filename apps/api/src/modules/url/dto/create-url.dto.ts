import { IsUrl, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUrlDto {
  @ApiProperty({
    description: 'The original URL to be shortened',
    example: 'https://github.com/sophiabiscottini/zip-link',
  })
  @IsUrl({}, { message: 'Please provide a valid URL' })
  url: string;

  @ApiPropertyOptional({
    description: 'Custom alias for the short URL (optional)',
    example: 'my-awesome-link',
    minLength: 3,
    maxLength: 20,
    pattern: '^[a-zA-Z0-9-_]+$',
  })
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Custom alias must be at least 3 characters' })
  @MaxLength(20, { message: 'Custom alias must be at most 20 characters' })
  @Matches(/^[a-zA-Z0-9-_]+$/, {
    message: 'Custom alias can only contain letters, numbers, hyphens, and underscores',
  })
  customAlias?: string;
}
