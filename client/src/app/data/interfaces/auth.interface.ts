export interface TokenResponse {
  access_token: string;
  refresh_token: string;
}
export interface DecodedToken {
    id: number;
    username: string;
  exp: number;
}
