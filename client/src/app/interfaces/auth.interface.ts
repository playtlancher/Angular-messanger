export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}
export interface DecodedToken {
  id: number;
  username: string;
  exp: number;
}
