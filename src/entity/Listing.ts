import { Entity, PrimaryGeneratedColumn, Column, IntegerType } from "typeorm"

@Entity("Listings")
export class Listing {

    @PrimaryGeneratedColumn()
    id: number

    @Column({ length: 300, type: "varchar" })
    title: string

    @Column({ length: 300, type: "varchar" })
    imgSrc: string

    @Column({ length: 300, type: "varchar" })
    href: string

    @Column({ type: "int" })
    year: IntegerType

    @Column({ type: "int" })
    price: IntegerType
}
