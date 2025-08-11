import { OAuthStateManager } from "../utils/authState";
import { Request, Response } from "express";
import { JWTService } from "../utils/jwt";
import { UserService } from "../services/userService";
import { ExtendedUser } from "../types/global";

export const oathInitiate = async (req: Request, res: Response) => {
  try {
    const state = await OAuthStateManager.createState("google");
    const redirectUrl = `/auth/signin/google?state=${state}`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error("OAuth initiation error:", error);
    res.redirect("/auth/error?error=OAuthError");
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(401).json({ error: "Refresh token required" });
    }

    // Verify refresh token
    const isValid = await JWTService.isRefreshTokenValid(refreshToken);
    if (!isValid) {
      res.status(403).json({ error: "Invalid or expired refresh token" });
    }

    const decoded = JWTService.verifyRefreshToken(refreshToken);
    const user = await UserService.getUserById(decoded.userId);

    if (!user) {
      res.status(404).json({ error: "User not found" });
    }

    // Generate new tokens
    const tokens = JWTService.generateTokens({
      sub: user?.id as string,
      email: user?.email as string,
    });

    // Remove old refresh token and store new one
    await JWTService.removeRefreshToken(refreshToken);
    await JWTService.storeRefreshToken(user?.id as string, tokens.refreshToken);

    res.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user?.id,
        email: user?.email,
        username: user?.username,
        name: user?.name,
        role: user?.role,
        image: user?.image,
      },
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(500).json({ error: "Failed to refresh token" });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: "Refresh token required" });
    }

    // Remove the refresh token from the database
    await JWTService.removeRefreshToken(refreshToken);

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Failed to log out" });
  }
};

export const me = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      res.status(401).json({ error: "Access token required" });
    }

    const decoded = JWTService.verifyAccessToken(token as string);
    const user = await UserService.getUserById(decoded.sub);

    if (!user) {
      res.status(404).json({ error: "User not found" });
    }
    const { id, email, username, name, role, image, timezone, createdAt } =
      user as ExtendedUser;

    res.json({
      id,
      email,
      username,
      name,
      role,
      image,
      timezone,
      createdAt,
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({ error: "Failed to get user profile" });
  }
};
