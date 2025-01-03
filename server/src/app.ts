import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import WebSocketService from "./services/WebSocketService";
import { attachControllers } from "@decorators/express";
import { init } from "./config/DB";
import AuthController from "./controllers/AuthController";
import ChatController from "./controllers/ChatController";
import { checkAccessToken } from "./middlewares/AuthMiddleware";
import Logger from "./Utils/Logger";
import UserController from "./controllers/UserController";

dotenv.config();

const app = express();
const webSocketService = new WebSocketService();

init();

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(checkAccessToken);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  }),
);

const corsOptions = {
  origin: ["http://localhost:4200"],
  methods: ["GET", "POST", "OPTIONS", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.static("public"));
await attachControllers(app, [AuthController, ChatController, UserController]);

const PORT: number = parseInt(process.env.PORT || "8000", 10);
const server = app.listen(PORT, () => {
  Logger.info(`🚀 Server running at http://localhost:${PORT}/`);
});

const wss = webSocketService.initWebSocketServer(server);

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
