import { User } from "../generated/prisma";

declare global {
    namespace Express {
      interface Request {
        user?: User; // Make it optional since not all routes will have it
      }
    }
  }