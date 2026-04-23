import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";

import helloRoutes from "./routes/hello.routes";

import { notFound } from "./middleware/notFound";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser(process.env.JWT_SECRET));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

app.use("/api/hello", helloRoutes);

app.get("/", (_req, res) => {
  res.send("Backend API is running");
});

app.use(notFound);
app.use(errorHandler);

export default app;
