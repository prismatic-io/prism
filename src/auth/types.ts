/** Credentials returned by the authorization server. */
export interface Auth {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  scope: string;
  tokenType: string;
  tenantId?: string;
}

export interface AuthenticationOptions {
  domain: string;
  clientId: string;
  audience: string;
  scopes: string[];
  successRedirectUri: string;
}
