import { GoogleProfile } from "../types/global";
import { prisma } from "../utils/prisma";
import { UsernameGenerator } from "../utils/username";

export class UserService {
  static async findOrCreateGoogleUser(profile: GoogleProfile): Promise<any> {
    // First, try to find existing user by email
    let user = await prisma.user.findUnique({
      where: { email: profile.email },
      include: { provider: true },
    });

    if (user) {
      // Check if Google account is already linked
      const googleAccount = user.provider.find((p) => p.provider === "google");

      if (!googleAccount) {
        // Link Google account to existing user
        await prisma.account.create({
          data: {
            userId: user.id,
            provider: "google",
            providerAccountId: profile.id,
          },
        });
      }
    } else {
      // Create new user with Google account
      const username = await UsernameGenerator.generateUniqueUsername(
        profile.name,
        profile.email
      );

      user = await prisma.user.create({
        data: {
          name: profile.name,
          username,
          email: profile.email,
          password: "", // Empty for OAuth users
          image: profile.picture,
          provider: {
            create: {
              provider: "google",
              providerAccountId: profile.id,
            },
          },
        },
        include: { provider: true },
      });
    }

    return user;
  }

  static async getUserById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      include: { provider: true },
    });
  }
}
