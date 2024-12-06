import { Router } from "express";
import * as userController from "../controllers/UserController";
import * as chatController from "../controllers/ChatController";
import { CheckToken } from "../middlewares/CheckToken";

const router = Router();

router.post("/registration", userController.postRegistration);
router.post("/login", userController.postLogin);
router.get("/logout", userController.logout);
router.get("/chats", CheckToken, chatController.getUserChats);
router.get("/chat/:chat_id", CheckToken, chatController.getChatMessages);
router.post("/chat/:chat_id", CheckToken, chatController.postMessage);
router.post("/refresh-token", userController.refreshAccessToken);
export default router;
