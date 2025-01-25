export interface ContactResponseI {
    isValid: boolean;
    errorMessages: string[];
}

export interface ListingsResponseI {
    title: string,
    href: string,
    price: number,
    year: number,
    imgSrc: string
}
export interface FleetResponseI {
    id: number;
    model: string;
    loadCapacity: number;
    gvm: number;
    platformLength: number;
    flatPartLength: number;
    slopeLength: number;
    platformWidth: number;
    platformHeight: number;
    loadingSlopeHeight: number;
    rampLength: number;
    maxLoadHeight: number;
    passengerSeats: number;
    imgSrc:string;
  }