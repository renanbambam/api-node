export interface UserPayload {
    sub: string;
    email: string;
    roles: string;
    company_id: string;
    branch_id?: string;
    refresh_token?: string;
    access_token?: string;
    iat?: number;
    exp?: number;
}
