import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { AuthModule } from '../auth/auth.module';
import { AboutProfile } from './entities/about-profile.entity';
import { AboutEducation } from './entities/about-education.entity';
import { AboutExperience } from './entities/about-experience.entity';
import { AboutBody } from './entities/about-body.entity';
import { MenuSection } from './entities/menu-section.entity';
import { SectionItemEntity } from './entities/section-item.entity';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      AboutProfile,
      AboutEducation,
      AboutExperience,
      AboutBody,
      MenuSection,
      SectionItemEntity,
    ]),
  ],
  controllers: [ContentController],
  providers: [ContentService],
  exports: [ContentService],
})
export class ContentModule {}
