import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('about_education')
export class AboutEducation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', default: 0, name: 'sort_order' })
  sortOrder: number;

  @Column({ type: 'varchar', length: 500 })
  institution: string;

  @Column({ type: 'varchar', length: 500 })
  document: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  qualification: string | null;
}
