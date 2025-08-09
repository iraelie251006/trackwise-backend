import { User } from "../generated/prisma";

declare global {
    namespace Express {
      interface Request {
        user?: User; // Make it optional since not all routes will have it
      }
    }
  }

  // types/socialAuth.ts
export enum SocialProvider {
  GOOGLE = 'google',
  GITHUB = 'github'
}

export interface SocialProfile {
  id: string;
  email: string;
  name: string;
  username?: string;
  avatar?: string;
  provider: SocialProvider;
  providerId: string;
}

export interface SocialAuthConfig {
  google: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  };
  github: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  };
}

export interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
}

// config/socialAuth.ts
export const socialAuthConfig: SocialAuthConfig = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback',
  },
  github: {
    clientId: process.env.GITHUB_CLIENT_ID || '',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    redirectUri: process.env.GITHUB_REDIRECT_URI || 'http://localhost:3000/api/auth/github/callback',
  },
};