export interface MessageI {
    id: number;
    timestamp: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    city: string;
    street: string;
    homeNumber: string;
    message: string;
}

export interface UserI {
    id: number;
    username: string;
    password: string;
    email: string;
    mfaEnabled: boolean;
    mfaSecret: string;
}