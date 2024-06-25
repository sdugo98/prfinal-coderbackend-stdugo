export class ChatService {
    constructor(dao){
        this.dao = new dao()
    }
    async saveMessage(datos){
        return await this.dao.saveMessage(datos)
    }

}
import { ChatDAO } from "../dao/chatDAO.js"
export const chatService = new ChatService(ChatDAO)