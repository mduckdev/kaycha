import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("ListingsPreferences")
export class ListingsPreferences  {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "boolean", default: true })
    showOtomoto: boolean;

    @Column({ type: "boolean", default: true })
    showDashboard: boolean;
}