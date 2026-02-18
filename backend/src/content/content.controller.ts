import { Controller, Get, Param } from '@nestjs/common';
import { ContentService } from './content.service';

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get('sections')
  getSections() {
    return this.contentService.getSections();
  }

  @Get(':id')
  getContent(@Param('id') id: string) {
    const content = this.contentService.getContent(id);
    if (!content) {
      return { error: 'Not found' };
    }
    return content;
  }
}
