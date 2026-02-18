import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Contacts } from './contacts.entity';
import { SocialNetwork } from './social-network.entity';
import { ContactInfoService } from './contact-info.service';
import { ContactInfoController } from './contact-info.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Contacts, SocialNetwork]), AuthModule],
  controllers: [ContactInfoController],
  providers: [ContactInfoService],
  exports: [ContactInfoService],
})
export class ContactInfoModule {}
