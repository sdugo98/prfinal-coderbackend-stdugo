import { chatService } from "../services/chat.Service.js";

export class ChatController {
  constructor() { }

  static async render(req, res) {
    try {
      res.status(200).render("chat");
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
  async saveMessage(datos) {
    try {
      let newMesagge = await chatService.saveMessage(datos)
      return newMesagge
    } catch (error) {
      return null
    }
  }
}