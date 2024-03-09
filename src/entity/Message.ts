import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity("Messages")
export class Message {

    @PrimaryGeneratedColumn()
    id: number

    @Column({ length: 30, type: "varchar" })
    firstName: string

    @Column({ length: 30, type: "varchar", nullable: true })
    lastName: string

    @Column({ length: 20, type: "varchar" })
    phoneNumber: string

    @Column({ length: 50, type: "varchar" })
    email: string

    @Column({ length: 30, type: "varchar" })
    city: string

    @Column({ length: 30, type: "varchar", nullable: true })
    street: string

    @Column({ length: 10, type: "varchar", nullable: true })
    homeNumber: string

    @Column({ length: 2000, type: "varchar" })
    message: string

    @Column({ type: "integer" })
    timestamp: number

    @Column({ length: 100, type: "varchar" })
    ipAddress: string

    @Column({ length: 20, type: "varchar" })
    portNumber: number
}
