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

  @Column({ type: 'varchar', length: 50, nullable: true })
  sourceType: string | null;

  @Column({ type: 'int', nullable: true })
  achievementId: number | null;

  @Column({ type: 'int', nullable: true })
  materialId: number | null;

  @Column({ type: 'int', nullable: true })
  linkId: number | null;
}
