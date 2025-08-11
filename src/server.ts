import express from "express";
import { PORT } from "./config/env";
import authRouter from "./routes/auth.routes";
import { notFound } from "./middlewares/notFound";
import helmet from "helmet";

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        // Allow scripts from self + Google OAuth domains
        "script-src": [
          "'self'",
          "https://accounts.google.com",
          "https://apis.google.com",
        ],
        // Allow Google OAuth iframes/popups
        "frame-src": ["'self'", "https://accounts.google.com"],
        // Allow images from self, HTTPS, and data URIs
        "img-src": ["'self'", "data:", "https://*.googleusercontent.com"],
        // Allow styles from self and inline styles (needed for some Google widgets)
        "style-src": ["'self'", "'unsafe-inline'"],
        // Default: everything else only from self
      },
    },
    crossOriginEmbedderPolicy: false, // Helps avoid blocking Google iframes
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    xFrameOptions: { action: "deny" }, // Prevents clickjacking except for explicitly allowed domains
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(notFound);

app.use("/api/auth", authRouter);

app.get("/", (req, res) => {
  res.json({ message: `Welcome to TrackWise API` });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
