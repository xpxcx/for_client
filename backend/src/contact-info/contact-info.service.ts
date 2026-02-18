import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contacts } from './contacts.entity';
import { SocialNetwork } from './social-network.entity';

export interface ContactInfoDto {
  phone: string | null;
  email: string | null;
  socialNetworks: { name: string; url: string }[];
}

@Injectable()
export class ContactInfoService {
  constructor(
    @InjectRepository(Contacts)
    private readonly contactsRepo: Repository<Contacts>,
    @InjectRepository(SocialNetwork)
    private readonly socialRepo: Repository<SocialNetwork>,
  ) {}

  async get(): Promise<ContactInfoDto> {
    const [contact] = await this.contactsRepo.find({ order: { id: 'ASC' }, take: 1 });
    const socialList = await this.socialRepo.find({ order: { id: 'ASC' } });
    return {
      phone: contact?.phone ?? null,
      email: contact?.email ?? null,
      socialNetworks: socialList.map((s) => ({ name: s.name, url: s.url })),
    };
  }

  async update(dto: Partial<ContactInfoDto>): Promise<ContactInfoDto> {
    const [contactExisting] = await this.contactsRepo.find({ order: { id: 'ASC' }, take: 1 });
    let contact = contactExisting ?? null;
    if (!contact) {
      contact = this.contactsRepo.create({ phone: dto.phone ?? null, email: dto.email ?? null });
      await this.contactsRepo.save(contact);
    } else {
      if (dto.phone !== undefined) contact.phone = dto.phone ?? null;
      if (dto.email !== undefined) contact.email = dto.email ?? null;
      await this.contactsRepo.save(contact);
    }

    if (dto.socialNetworks !== undefined) {
      await this.socialRepo.clear();
      if (dto.socialNetworks.length > 0) {
        const rows = dto.socialNetworks
          .filter((s) => s && typeof s.name === 'string' && typeof s.url === 'string' && s.name.trim() && s.url.trim())
          .map((s) => this.socialRepo.create({ name: s.name.trim(), url: s.url.trim() }));
        if (rows.length > 0) await this.socialRepo.save(rows);
      }
    }

    return this.get();
  }
}
