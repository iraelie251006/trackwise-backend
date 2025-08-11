import { Router } from "express";
import { SignIn, SignUp } from "../controllers/auth.controller";
import { authConfig } from "../config/auth.config";
import {
  logout,
  me,
  oathInitiate,
  refresh,
} from "../controllers/socialAuth.controller";
import { authenticateToken } from "../middlewares/socialAuth.middleware";

const authRouter = Router();
// Social Authentication
authRouter.use("/auth/*", authConfig);

authRouter.get("/auth/google", oathInitiate);

authRouter.post("/auth/refresh", refresh);

authRouter.post("/auth/logout", logout);

authRouter.get("/auth/me", authenticateToken, me);

// User Authentication
authRouter.post("/sign-in", SignIn);

authRouter.post("/sign-up", SignUp);

export default authRouter;
