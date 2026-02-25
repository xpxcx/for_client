import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('section_item')
export class SectionItemEntity {
  @PrimaryColumn({ type: 'varchar', length: 100 })
  id: string;

  @Column({ type: 'varchar', length: 100, name: 'section_id' })
  sectionId: string;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  link: string | null;

  @Column({ type: 'int', default: 0, name: 'sort_order' })
  sortOrder: number;
}
