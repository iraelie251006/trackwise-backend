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

export interface JWTPayload {
  sub: string;
  email: string;
  username?: string;
  role?: string;
  iat?: number;
  exp?: number;
}

export interface ExtendedUser {
  id: string;
  email: string;
  name: string;
  image?: string;
  username: string;
  role: string;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExtendedToken {
  userId?: string;
  email?: string;
  username?: string;
  role?: string;
  name?: string;
  image?: string;
  timezone?: string;
  createdAt?: Date;
  updatedAt?: Date;
  accessToken?: string;
  refreshToken?: string;
  iat?: number;
  exp?: number;
}

export interface ExtendedSession {
  user: {
    id: string;
    email: string;
    name: string;
    image?: string;
    username: string;
    role: string;
    timezone: string;
    createdAt: Date;
    updatedAt: Date;
  };
  accessToken: string;
  refreshToken: string;
  tokenIssuedAt?: Date;
  tokenExpiresAt?: Date;
  expires: string;
}

// Auth.js module augmentation for TypeScript
declare module '@auth/express' {
  interface Session extends ExtendedSession {}
  interface User extends ExtendedUser {}
  interface JWT extends ExtendedToken {}
}