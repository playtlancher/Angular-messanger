"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const WebSocketService_1 = require("./services/WebSocketService");
const MainRouter_1 = __importDefault(require("./router/MainRouter"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use(
  (0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60,
    },
  }),
);
app.use(
  (0, cors_1.default)({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);
app.use(express_1.default.static("public"));
app.use("/", MainRouter_1.default);
const PORT = parseInt(process.env.PORT || "8000", 10);
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}/`);
});
const wss = (0, WebSocketService_1.initWebSocketServer)(server);
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
