
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Sign } from '../signs/signs.entity';


@Entity('SignType')
export class SignType {
    @PrimaryGeneratedColumn({ name: 'SignTypeId' })
    SignTypeId!: number;

    @Column({ name: 'NameSignType', type: 'nvarchar', length: 'MAX'})
    NameSignType!: string;

    @Column({ name: 'Description', type: 'nvarchar', length: 'MAX', nullable: true })
    Description?: string;

    @OneToMany(() => Sign, (sign) => sign.signType)
    sign!: Sign[];
}