import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('educator_contacts')
export class Contacts {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;
}
