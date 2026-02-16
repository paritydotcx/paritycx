import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { config } from "dotenv";

import { analyzeRouter } from "./routes/analyze";
import { skillsRouter } from "./routes/skills";
import { contextRouter } from "./routes/context";
import { programsRouter } from "./routes/programs";
import { healthRouter } from "./routes/health";
import { authMiddleware } from "./middleware/auth";
import { errorHandler } from "./middleware/error";
import { logger } from "./utils/logger";

config();

// Middleware order matters: cors, json, auth, routes, error
const app = express();
const PORT = process.env.PORT || 3100;

app.use(helmet());
app.use(
    cors({
        origin: process.env.CORS_ORIGIN || "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Parity-SDK-Version"],
    })
);
app.use(express.json({ limit: "10mb" }));
app.use(morgan("combined", { stream: { write: (msg) => logger.info(msg.trim()) } }));

const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Rate limit exceeded. Please wait before making more requests." },
});

app.use(limiter);

app.use("/v1/health", healthRouter);

app.use("/v1/analyze", authMiddleware, analyzeRouter);
app.use("/v1/skills", authMiddleware, skillsRouter);
app.use("/v1/context", authMiddleware, contextRouter);
app.use("/v1/programs", authMiddleware, programsRouter);

app.use(errorHandler);

app.use((_req, res) => {
    res.status(404).json({
        error: "Not Found",
        message: "The requested endpoint does not exist",
        docs: "https://parity.cx/docs",
    });
});

app.listen(PORT, () => {
    logger.info(`Parity API server running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
});

export default app;
