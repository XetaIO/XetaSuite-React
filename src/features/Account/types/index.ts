/**
 * Account types
 */

export interface UpdatePasswordData {
    current_password: string;
    password: string;
    password_confirmation: string;
}

export interface UpdatePasswordResponse {
    message: string;
}
