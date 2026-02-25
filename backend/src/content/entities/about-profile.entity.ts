import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('about_profile')
export class AboutProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500, default: 'Раздел о себе', name: 'page_title' })
  pageTitle: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'full_name' })
  fullName: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'birth_date' })
  birthDate: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'image_url' })
  imageUrl: string | null;
}
