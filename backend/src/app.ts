import express, { type Express } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import env from "@configs/env.config.js";
import indexRouter from "@routes/index.route.js";
import { globalErrorHandler } from "@middlewares/error.middleware.js";

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
    origin: [env.CORS_ORIGIN, "*"], // "*" --> Allow all origins for development purposes, but consider restricting this in production
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(helmet());
app.use(
  helmet.hsts({ maxAge: 31536000, includeSubDomains: true, preload: true }),
);

app.use("/api/v1", indexRouter);

app.use(globalErrorHandler);

export default app;
