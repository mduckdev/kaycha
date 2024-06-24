import { Entity, PrimaryGeneratedColumn, Column, IntegerType } from "typeorm"
import { Length, IsInt, Min, Max, IsUrl } from "class-validator";
import { ListingsResponseI } from "../interfaces/responses";
@Entity("Listings")
export class Listing {

    @PrimaryGeneratedColumn()
    id: number

    @Column({ length: 300, type: "varchar" })
    @Length(1, 300, { message: "Tytuł musi zawierać od 1 do 300 znaków" })
    title: string

    @Column({ length: 300, type: "varchar" })
    @Length(1, 300, { message: "Adres URL obrazu musi zawierać od 1 do 300 znaków." })
    @IsUrl({}, { message: "Adres URL obrazu musi być prawidłowym adresem URL." })
    imgSrc: string

    @Column({ length: 300, type: "varchar" })
    @Length(1, 300, { message: "Adres URL linku musi zawierać od 1 do 300 znaków." })
    @IsUrl({}, { message: "Adres URL linku musi być prawidłowym adresem URL." })
    href: string

    @Column({ type: "int" })
    @IsInt({ message: "Rok musi być liczbą całkowitą." })
    @Min(1900, { message: "Rok musi wynosić co najmniej 1900." })
    @Max(new Date().getFullYear() + 3, { message: `Rok musi wynosić co najwyżej ${new Date().getFullYear() + 3}.` })
    year: number

    @Column({ type: "int" })
    @IsInt({ message: "Cena musi być liczbą całkowitą." })
    @Min(0, { message: "Cena musi wynosić co najmniej 0." })
    price: number

    toResponseObject(): ListingsResponseI {
        const { title, href, price, year, imgSrc } = this;
        return { title, href, price, year, imgSrc };
    }
}
