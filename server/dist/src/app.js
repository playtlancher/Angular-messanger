import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import { initWebSocketServer } from "./services/WebSocketService";
import MainRouter from "./router/MainRouter";
import { init } from "./config/DB";
dotenv.config();
const app = express();
init();
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 1000 * 60 * 60,
    },
}));
app.use(cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:4200",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));
app.use(express.static("public"));
app.use("/", MainRouter);
const PORT = parseInt(process.env.PORT || "8000", 10);
const server = app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}/`);
});
const wss = initWebSocketServer(server);
process.on("SIGINT", () => {
    console.log("\nShutting down server...");
    server.close(() => {
        console.log("HTTP server closed.");
    });
    wss.close(() => {
        console.log("WebSocket server closed.");
    });
    process.exit();
});
