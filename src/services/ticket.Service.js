export class TicketService{
    constructor(dao){
        this.dao = new dao()
    }

    async getTicket(id){
        return await this.dao.getTicket(id)
    }

    async createTicket(content){
        return await this.dao.createTicket(content)
    }

    async getTicketByID(tid){
        return await this.dao.getTicketByID(tid)
    }
}

import { TicketsDAO } from "../dao/ticketsDAO.js"
export const ticketService = new TicketService(TicketsDAO)