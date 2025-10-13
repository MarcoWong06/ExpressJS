import express from "express";
import helmet from "helmet";
import cors from "cors";
import apiRouter from "./api";
const app = express();
const port = parseInt(process.env.PORT || "3000", 10);
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: process.env.NODE_ENV === "production" ? [] : null,
        },
    },
}));
app.use(cors({
    origin: process.env.NODE_ENV === "production" ? [
        "http://localhost"
    ] : true,
    credentials: true,
}));
app.use(express.json());
app.get("/", (_req, res) => {
    res.send(`cap-cws-express`);
});
app.get("/health", (_req, res) => {
    res.status(200).json({
        status: "OK",
        message: "Service is healthy",
        timestamp: new Date().toISOString(),
    });
});
app.use("/api", apiRouter);
app.listen(port, "0.0.0.0", () => {
    console.log(`服務器運行在 http://localhost:${port}`);
    console.log(`環境: ${process.env.NODE_ENV || "development"}`);
});
export default app;
//# sourceMappingURL=server-index.js.map