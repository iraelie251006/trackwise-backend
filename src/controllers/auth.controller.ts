import { prisma } from "../utils/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  ACCESS_TOKEN_EXPIRES,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRES,
  REFRESH_TOKEN_SECRET,
} from "../config/env";
import { Prisma } from "../generated/prisma";
import { NextFunction, Request, Response } from "express";
import dayjs from "dayjs";

export const SignIn = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        error: { message: "Email is required." },
      });
      return;
    }

    if (!password) {
      res.status(400).json({
        success: false,
        error: { message: "Password is required." },
      });
      return;
    }

    const { accessToken, user } = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const user = await tx.user.findUnique({
          where: {
            email,
          },
        });

        if (!user) throw new Error("USER_NOT_FOUND");

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) throw new Error("INVALID_PASSWORD");

        if (
          !process.env.ACCESS_TOKEN_SECRET ||
          !process.env.REFRESH_TOKEN_SECRET
        ) {
          throw new Error(
            "JWT secrets are missing in the environment variables."
          );
        }

        if (
          !process.env.ACCESS_TOKEN_EXPIRES ||
          !process.env.REFRESH_TOKEN_EXPIRES
        ) {
          throw new Error(
            "JWT expiration values are missing in the environment variables."
          );
        }

        const accessToken = jwt.sign(
          { sub: user.id, email: user.email, tokenType: "access" },
          ACCESS_TOKEN_SECRET,
          {
            expiresIn: ACCESS_TOKEN_EXPIRES,
            algorithm: "HS256",
          }
        );

        const refreshToken = jwt.sign(
          { sub: user.id, email: user.email, tokenType: "refresh" },
          REFRESH_TOKEN_SECRET,
          {
            expiresIn: REFRESH_TOKEN_EXPIRES,
            algorithm: "HS256",
          }
        );
        // store refresh token in the database
        await tx.refreshToken.create({
          data: {
            token: refreshToken,
            userId: user.id,
            expiresAt: dayjs().add(REFRESH_TOKEN_EXPIRES, "second").toDate(),
          },
        });

        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: REFRESH_TOKEN_EXPIRES * 1000,
          path: "/api/auth",
        });

        return {
          accessToken,
          user,
        };
      }
    );

    res.status(200).json({
      success: true,
      message: "User signed in successfully.",
      data: { accessToken, user },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "USER_NOT_FOUND") {
      res.status(404).json({
        success: false,
        error: { message: "User not found. please SignUp." },
      });
      return;
    }
    if (error instanceof Error && error.message === "INVALID_PASSWORD") {
      res.status(401).json({
        success: false,
        error: { message: "Incorrect Password." },
      });
      return;
    }
    next(error);
  }
};

export const SignUp = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, username, email, password } = req.body;
    const requiredFields: Record<string, string> = {
      email,
      password,
      name,
      username,
    };
    const missingFields = Object.keys(requiredFields).filter(
      (key) => !requiredFields[key]
    );

    if (missingFields.length > 0) {
      res.status(400).json({
        success: false,
        error: {
          message: `${missingFields.length === 1 ? `${missingFields} is required` : `${missingFields.join(", ")} are required`}.`,
        },
      });
      return;
    }

    const { accessToken, user } = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const existingUser = await tx.user.findUnique({
          where: {
            email,
          },
        });
        if (existingUser) throw new Error("USER_ALREADY_EXISTS");

        const existingUsername = await tx.user.findUnique({
          where: {
            username,
          },
        });

        if (existingUsername) throw new Error("USERNAME_ALREADY_EXISTS");

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await tx.user.create({
          data: { name, email, username, password: hashedPassword },
        });

        if (
          !process.env.ACCESS_TOKEN_SECRET ||
          !process.env.REFRESH_TOKEN_SECRET
        ) {
          throw new Error(
            "JWT secrets are missing in the environment variables."
          );
        }

        if (
          !process.env.ACCESS_TOKEN_EXPIRES ||
          !process.env.REFRESH_TOKEN_EXPIRES
        ) {
          throw new Error(
            "JWT expiration values are missing in the environment variables."
          );
        }

        const accessToken = jwt.sign(
          { sub: newUser.id, email: newUser.email, tokenType: "access" },
          ACCESS_TOKEN_SECRET,
          { expiresIn: ACCESS_TOKEN_EXPIRES, algorithm: "HS256" }
        );

        const refreshToken = jwt.sign(
          { sub: newUser.id, email: newUser.email, tokenType: "refresh" },
          REFRESH_TOKEN_SECRET,
          {
            expiresIn: REFRESH_TOKEN_EXPIRES,
            algorithm: "HS256",
          }
        );

        // store refresh token in the database
        await tx.refreshToken.create({
          data: {
            token: refreshToken,
            userId: newUser.id,
            expiresAt: dayjs().add(REFRESH_TOKEN_EXPIRES, "second").toDate(),
          },
        });

        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: REFRESH_TOKEN_EXPIRES * 1000,
          path: "/api/auth",
        });

        return { accessToken, user: newUser };
      }
    );

    res.status(201).json({
      success: true,
      message: "User signed up successfully.",
      data: { accessToken, user },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "USERNAME_ALREADY_EXISTS") {
      res.status(400).json({
        success: false,
        error: { message: "Username already exists." },
      });
      return;
    }
    next(error);
  }
};

export const SignOut = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      res.status(200).json({
        success: true,
        message: { message: "User signed out successfully." },
      });
      return;
    }
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth",
    });
    await prisma.refreshToken
      .delete({
        where: {
          token: refreshToken,
        },
      })
      .catch(() => null);

    res.status(200).json({
      success: true,
      message: "User signed out successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export const SignOutEverywhere = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth",
    });

    if (!refreshToken) {
      res.status(200).json({
        success: true,
        message: "User signed out from all devices successfully.",
      });
      return;
    }

    const tokenRecord = await prisma.refreshToken.findFirst({
      where: { token: refreshToken },
      select: { userId: true },
    });

    if (tokenRecord) {
      await prisma.refreshToken.deleteMany({
        where: { userId: tokenRecord.userId },
      });
    }

    res.status(200).json({
      success: true,
      message: "User signed out from all devices successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      res.status(401).json({
        success: false,
        error: { message: "Refresh token is required." },
      });
      return;
    }

    const tokenRecord = await prisma.refreshToken.findFirst({
      where: {
        token: refreshToken,
        expiresAt: {
          gt: dayjs().format("YYYY-MM-DD HH:mm:ss"), // Ensure the token is not expired
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!tokenRecord) {
      res.status(401).json({
        success: false,
        error: { message: "Invalid or expired refresh token." },
      });
      return;
    }

    const newAccessToken = jwt.sign(
      {
        sub: tokenRecord?.user?.id,
        email: tokenRecord?.user?.email,
        tokenType: "access",
      },
      ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRES, algorithm: "HS256" }
    );

    const { newRefreshToken } = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // Token rotation
        const newRefreshToken = jwt.sign(
          {
            sub: tokenRecord.user.id,
            email: tokenRecord.user.email,
            tokenType: "refresh",
          },
          REFRESH_TOKEN_SECRET,
          { expiresIn: REFRESH_TOKEN_EXPIRES, algorithm: "HS256" }
        );
        const newRefreshTokenExpires = dayjs()
          .add(REFRESH_TOKEN_EXPIRES, "second")
          .toDate();
        // Delete the old refresh token
        await tx.refreshToken.deleteMany({
          where: {
            token: refreshToken,
          },
        });
        // Create a new refresh token
        await tx.refreshToken.create({
          data: {
            token: newRefreshToken,
            userId: tokenRecord.user.id,
            expiresAt: newRefreshTokenExpires,
          },
        });
        return { newRefreshToken };
      }
    );

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: REFRESH_TOKEN_EXPIRES * 1000,
      path: "/api/auth",
    });

    res.status(200).json({
      success: true,
      message: "Tokens refreshed successfully.",
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};
