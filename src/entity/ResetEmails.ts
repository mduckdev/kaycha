import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn } from "typeorm"

@Entity("ResetEmails")
export class ResetEmail {

    @PrimaryColumn({length:32,type:"text"})
    token:string

    @Column({ length: 50, type: "varchar"})
    email: string

    @Column("bigint")
    generatedAt = Date.now();

    @Column("boolean")
    valid:boolean=true
}
