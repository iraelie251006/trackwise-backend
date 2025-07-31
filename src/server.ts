import express from "express";
import { PORT } from "./config/env";
import authRouter from "./routes/auth.routes";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/api/auth", authRouter);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to TrackWise API" });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
