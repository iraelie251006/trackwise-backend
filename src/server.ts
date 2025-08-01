import express from "express";
import { PORT } from "./config/env";
import authRouter from "./routes/auth.routes";
import { notFound } from "./middlewares/notFound";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(notFound)

app.use("/api/auth", authRouter);

app.get("/", (req, res) => {
  res.json({ message: `Welcome to TrackWise API` });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
