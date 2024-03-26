import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity("Users")
export class User {

    @PrimaryGeneratedColumn()
    id: number

    @Column({ length: 30, type: "varchar", unique: true })
    username: string

    @Column({ length: 150, type: "varchar" })
    password: string

    @Column({ length: 50, type: "varchar", nullable: true })
    email: string

    @Column({ type: "boolean", default: false })
    mfaEnabled: boolean

    @Column({ length: 100, type: "varchar", nullable: true })
    mfaSecret: string | null
}
