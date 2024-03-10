export interface otomotoDataI {
    url: string,
    access_token: string | null,
    expires: number
}

export interface DictionaryI {
    [key: string]: {
        allFieldsRequired: string;
        incorrectEmail: string;
        incorrectPhoneNumber: string;
        incorrectCaptcha: string;
        errorCaptcha: string;
    };
}
