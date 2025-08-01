import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET } from "../config/env";
import { prisma } from "../utils/prisma";

export const authorize = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        };

        const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);

        const user = await prisma.user.findUnique(decoded.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                error: { message: "Unauthorized user." },
            });
        };

        req.user = user;
        
        next();
    } catch (error) {
        next(error)
    }
}