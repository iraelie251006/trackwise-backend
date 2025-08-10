import jwt from "jsonwebtoken"
import { prisma } from './prisma';
import dayjs from 'dayjs';
import { AUTH_SECRET } from "../config/env";

export class OAuthStateManager {
  static async createState(provider: string): Promise<string> {
    const expiresAt = dayjs().add(10, "minute").toDate();
    const state = jwt.sign({provider}, AUTH_SECRET, {expiresIn: "10m"});    

    await prisma.oAuthState.create({
      data: {
        state,
        provider,
        expiresAt,
      },
    });

    return state;
  }

  static async validateAndRemoveState(state: string, provider: string): Promise<boolean> {
    const oauthState = await prisma.oAuthState.findUnique({
      where: { state },
    });

    if (!oauthState || oauthState.provider !== provider || oauthState.expiresAt < dayjs().toDate()) {
      return false;
    }

    // Remove the used state
    await prisma.oAuthState.delete({
      where: { state },
    });

    return true;
  }

  static async cleanupExpiredStates(): Promise<void> {
    await prisma.oAuthState.deleteMany({
      where: {
        expiresAt: {
          lt: dayjs().toDate(),
        },
      },
    });
  }
}