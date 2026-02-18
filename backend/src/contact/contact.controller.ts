import { Body, Controller, Post } from '@nestjs/common';

export class ContactDto {
  name: string;
  email: string;
  category?: string;
  message: string;
}

@Controller('contact')
export class ContactController {
  @Post()
  send(@Body() body: ContactDto) {
    return { success: true, message: 'Сообщение принято' };
  }
}
