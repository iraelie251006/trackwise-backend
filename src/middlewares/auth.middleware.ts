import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET } from "../config/env";
import { prisma } from "../utils/prisma";

export const authorize = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: { message: "Access token is required." },
      });
    }

    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET, { algorithms: ["HS256"] });

    if (typeof decoded === "string" || !decoded.sub) {
      return res.status(401).json({
        success: false,
        error: { message: "Invalid token format." },
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.sub,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { message: "Unauthorized user." },
      });
    }

    req.user = user;

    next();
  } catch (error) {
    // Handle specific JWT errors
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        error: { message: "Invalid token." },
      });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        error: { message: "Token expired." },
      });
    }
    if (error instanceof jwt.NotBeforeError) {
      return res.status(401).json({
        success: false,
        error: { message: "Token not active yet." },
      });
    }
    next(error);
  }
};
