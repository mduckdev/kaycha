export interface ContactResponseI {
    isValid: boolean;
    errorMessages: string[];
}

export interface ListingsResponseI {
    title: string,
    href: string,
    price: number,
    year: number,
    src: string
}