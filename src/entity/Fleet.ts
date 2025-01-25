import { Entity, PrimaryGeneratedColumn, Column, IntegerType } from "typeorm"
import { IsInt, IsString, Max, Min, Length, MaxLength, MinLength, isURL, IsUrl } from 'class-validator';
import { FleetResponseI } from "../interfaces/responses";
@Entity("Fleet")
export class FleetVehicle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  @IsString()
  @Length(1, 255)
  model: string; // Np. "MAN TGL 12.210 Euro 4"

  @Column({ type: 'int' })
  @IsInt()
  @Min(0)
  loadCapacity: number; // Ładowność w kilogramach

  @Column({ type: 'int' })
  @IsInt()
  @Min(0)
  gvm: number; // DMC (dopuszczalna masa całkowita) w kilogramach

  @Column({ type: 'int' })
  @IsInt()
  @Min(0)
  platformLength: number; // Długość najazdu w cm

  @Column({ type: 'int' })
  @IsInt()
  @Min(0)
  flatPartLength: number; // Część płaska w cm

  @Column({ type: 'int' })
  @IsInt()
  @Min(0)
  slopeLength: number; // Długość skosu w cm

  @Column({ type: 'int' })
  @IsInt()
  @Min(0)
  platformWidth: number; // Szerokość najazdu w cm

  @Column({ type: 'int' })
  @IsInt()
  @Min(0)
  platformHeight: number; // Wysokość wypoziomowana w cm

  @Column({ type: 'int' })
  @IsInt()
  @Min(0)
  loadingSlopeHeight: number; // Wysokość skosu do załadunku w cm

  @Column({ type: 'int' })
  @IsInt()
  @Min(0)
  rampLength: number; // Długość najazdów w cm

  @Column({ type: 'int' })
  @IsInt()
  @Min(0)
  maxLoadHeight: number; // Maksymalna wysokość ładunku w cm

  @Column({ type: 'int' })
  @IsInt()
  @Min(0)
  @Max(10)
  passengerSeats: number; // Liczba miejsc pasażera

  @Column({ type: 'varchar', length:300 , nullable:true })
  @IsUrl()
  @MinLength(0)
  @MaxLength(300)
  imgSrc: string; 

    toResponseObject(): FleetResponseI {
        const {
          id,
          model,
          loadCapacity,
          gvm,
          platformLength,
          flatPartLength,
          slopeLength,
          platformWidth,
          platformHeight,
          loadingSlopeHeight,
          rampLength,
          maxLoadHeight,
          passengerSeats,
          imgSrc
        } = this;
    
        return {
          id,
          model,
          loadCapacity,
          gvm,
          platformLength,
          flatPartLength,
          slopeLength,
          platformWidth,
          platformHeight,
          loadingSlopeHeight,
          rampLength,
          maxLoadHeight,
          passengerSeats,
          imgSrc
        };
      }
}
