import { Prisma } from "@prisma/client";
import { ActionResponse, ReqResNextObject } from "../types/global";
import { prisma } from "../utils/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_EXPIRES, ACCESS_TOKEN_SECRET } from "../config/env";

export const SignIn = async ({ req, res, next }: ReqResNextObject) => {
  try {
  } catch (error) {
    next(error);
  }
};

export const SignUp = async ({ req, res, next }: ReqResNextObject) => {
  try {
    const { name, username, email, password } = req.body;

    if (!email || !password || !name || !username) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Name, username, email and password are required.",
        },
      } satisfies ActionResponse);
    }

    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const existingUser = await prisma.user.findUnique({
          where: {
            email,
          },
        });
        if (existingUser) {
          return res.status(400).json({
            success: false,
            error: { message: "User already exists with this email." },
          } satisfies ActionResponse);
        }

        const existingUsername = await prisma.user.findUnique({
          where: {
            username,
          },
        });

        if (existingUsername) {
          return res.status(400).json({
            success: false,
            error: { message: "Username already exists." },
          } satisfies ActionResponse);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await tx.user.create({
          data: { name, email, password: hashedPassword },
        });

        const accessToken = jwt.sign(
          { userId: newUser.id },
          ACCESS_TOKEN_SECRET,
          { expiresIn: ACCESS_TOKEN_EXPIRES }
        );

        return { accessToken, newUser };
      }
    );

    const { accessToken, newUser } = result;
    return res.status(201).json({
      success: true,
      data: JSON.parse(
        JSON.stringify({
          accessToken: accessToken,
          user: newUser,
        })
      ),
    } satisfies ActionResponse);
  } catch (error) {
    next(error);
  }
};
