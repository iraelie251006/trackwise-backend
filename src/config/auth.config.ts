import { ExpressAuth } from "@auth/express";
import Google from "@auth/express/providers/google";
import { UserService } from "../services/userService";
import { AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET } from "./env";
import { JWTService } from "../utils/jwt";

export const authConfig = ExpressAuth({
  providers: [
    Google({
      clientId: AUTH_GOOGLE_ID!,
      clientSecret: AUTH_GOOGLE_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  pages: {
    error: "/auth/error",
    signIn: "/auth/signin",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        if (account?.provider === "google" && profile) {
          const googleProfile = {
            id: account.providerAccountId,
            email: profile.email!,
            name: profile.name!,
            picture: profile.picture,
          };

          const dbUser =
            await UserService.findOrCreateGoogleUser(googleProfile);

          // Store user data for later use in jwt callback
          user.id = dbUser.id;
          user.username = dbUser.username;

          return true;
        }
        return false;
      } catch (error) {
        console.error("Sign in error:", error);
        return false;
      }
    },

    async jwt({ token, user, account }) {
      if (user && account?.provider === "google") {
        // Generate custom JWT tokens
        const tokens = JWTService.generateTokens({
          sub: user.id!,
          email: user.email!,
          username: user.username,
        });

        // Store refresh token
        await JWTService.storeRefreshToken(user.id!, tokens.refreshToken);

        token.accessToken = tokens.accessToken;
        token.refreshToken = tokens.refreshToken;
        token.userId = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.userId as string;
        session.accessToken = token.accessToken as string;
        session.refreshToken = token.refreshToken as string;
      }
      return session;
    },
  },
  trustHost: true,
  secret: process.env.AUTH_SECRET!,
});
