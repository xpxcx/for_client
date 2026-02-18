import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('news')
export class News {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text' })
  text: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'int', nullable: true })
  achievementId: number | null;
}
