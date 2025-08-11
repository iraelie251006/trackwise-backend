import jwt from 'jsonwebtoken';

import { ACCESS_TOKEN_EXPIRES, ACCESS_TOKEN_SECRET, REFRESH_TOKEN_EXPIRES, REFRESH_TOKEN_SECRET } from '../config/env';
import { AuthTokens, JWTPayload } from '../types/global';
import { prisma } from './prisma';
import dayjs from 'dayjs';

export class JWTService {
  private static readonly JWT_SECRET = ACCESS_TOKEN_SECRET;
  private static readonly JWT_REFRESH_SECRET = REFRESH_TOKEN_SECRET;
  private static readonly JWT_EXPIRES_IN = ACCESS_TOKEN_EXPIRES || '1d';
  private static readonly JWT_REFRESH_EXPIRES_IN = REFRESH_TOKEN_EXPIRES || '7d';

  static generateTokens(payload: Omit<JWTPayload, 'iat' | 'exp'>): AuthTokens {
    const accessToken = jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
      algorithm: 'HS256',
    });

    const refreshToken = jwt.sign(
      { sub: payload.sub },
      this.JWT_REFRESH_SECRET,
      { expiresIn: this.JWT_REFRESH_EXPIRES_IN, algorithm: 'HS256' }
    );

    return { accessToken, refreshToken };
  }

  static verifyAccessToken(token: string): JWTPayload {
    return jwt.verify(token, this.JWT_SECRET) as JWTPayload;
  }

  static verifyRefreshToken(token: string): { userId: string } {
    return jwt.verify(token, this.JWT_REFRESH_SECRET) as { userId: string };
  }

  static async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const expiresAt = dayjs().add(7, 'day').toDate();

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt,
      },
    });
  }

  static async removeRefreshToken(token: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { token },
    });
  }

  static async isRefreshTokenValid(token: string): Promise<boolean> {
    const refreshToken = await prisma.refreshToken.findUnique({
      where: { token },
    });

    return refreshToken !== null && refreshToken.expiresAt > dayjs().toDate();
  }
}
