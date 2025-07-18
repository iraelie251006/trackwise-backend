import { Router } from "express";
import { SignIn, SignUp } from "../controllers/auth.controller";

const authRouter = Router();

authRouter.post("/sign-in", SignIn);

authRouter.post("/sign-up", SignUp);

export default authRouter;