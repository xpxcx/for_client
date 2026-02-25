import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('menu_section')
export class MenuSection {
  @PrimaryColumn({ type: 'varchar', length: 100 })
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 255 })
  path: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string | null;

  @Column({ type: 'int', default: 0, name: 'sort_order' })
  sortOrder: number;
}
