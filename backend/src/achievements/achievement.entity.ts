import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('achievements')
export class Achievement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text', default: '' })
  description: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl: string | null;
}
