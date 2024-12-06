import { Router } from "express";
import * as userController from "../controllers/UserController";
import * as chatController from "../controllers/ChatController";
const router = Router();
router.post("/registration", userController.postRegistration);
router.post("/login", userController.postLogin);
router.get("/logout", userController.logout);
router.get("/chats", chatController.getUserChats);
// @ts-ignore
router.get("/chat/:chat_id", chatController.getChatMessages);
// @ts-ignore
router.post("/chat/:chat_id", chatController.postMessage);
export default router;
