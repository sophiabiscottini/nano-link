import { ApiProperty } from '@nestjs/swagger';

export class UrlResponseDto {
  @ApiProperty({
    description: 'The complete shortened URL',
    example: 'http://localhost:3000/abc123',
  })
  shortUrl: string;

  @ApiProperty({
    description: 'The short code/alias',
    example: 'abc123',
  })
  shortCode: string;

  @ApiProperty({
    description: 'The original URL',
    example: 'https://github.com/sophiabiscottini/nano-link',
  })
  originalUrl: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-12-09T10:00:00.000Z',
  })
  createdAt: Date;
}
