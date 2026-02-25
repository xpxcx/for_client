import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('about_experience')
export class AboutExperience {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', default: 0, name: 'sort_order' })
  sortOrder: number;

  @Column({ type: 'varchar', length: 500, name: 'place_of_work' })
  placeOfWork: string;

  @Column({ type: 'varchar', length: 500 })
  position: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  period: string | null;
}
