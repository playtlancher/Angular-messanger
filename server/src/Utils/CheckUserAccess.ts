import ChatUserRepository from "../repositories/ChatUserRepository";

const chatUserRepository = new ChatUserRepository();
export default async function CheckUserAccess(userId: number, chatId: number): Promise<boolean> {
  const result = await chatUserRepository.findAllBy({
    user_id: userId,
    chat_id: chatId,
  });
  return result.length > 0;
}
