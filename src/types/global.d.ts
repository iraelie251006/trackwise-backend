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
}

export interface GoogleProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}