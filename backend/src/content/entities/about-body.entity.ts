import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('about_body')
export class AboutBody {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', default: 0, name: 'sort_order' })
  sortOrder: number;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text' })
  description: string;
}
