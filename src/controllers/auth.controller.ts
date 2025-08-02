import { prisma } from "../utils/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_EXPIRES, ACCESS_TOKEN_SECRET } from "../config/env";
import { Prisma } from "../generated/prisma";
import { NextFunction, Request, Response } from "express";

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
