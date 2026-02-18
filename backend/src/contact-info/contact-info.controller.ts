import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { ContactInfoService } from './contact-info.service';

@Controller('contact-info')
export class ContactInfoController {
  constructor(private readonly contactInfoService: ContactInfoService) {}

  @Get()
  get() {
    return this.contactInfoService.get();
  }

  @Patch()
  @UseGuards(JwtAuthGuard, AdminGuard)
  update(
    @Body()
    body: Partial<{
      phone: string | null;
      email: string | null;
      socialNetworks: { name: string; url: string }[];
    }>,
  ) {
    return this.contactInfoService.update(body);
  }
}
