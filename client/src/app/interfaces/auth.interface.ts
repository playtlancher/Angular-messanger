export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}
export interface DecodedToken {
  id: number;
  username: string;
  avatar: string;
  exp: number;
}
