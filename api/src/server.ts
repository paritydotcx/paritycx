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