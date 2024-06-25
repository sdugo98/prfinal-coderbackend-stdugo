import { ticketsModel } from "./models/ticketModel.js";


export class TicketsDAO {
    constructor() { }
    async createTicket(content, total) {
        try {
            let newTicket = ticketsModel.create(content)
            return newTicket
        } catch (error) {
            return error;
        }
    }

    async getTicketByID(tid) {

        try {
            let ticket = ticketsModel.findOne({ _id: tid })
            return ticket
        } catch (error) {
            return error
        }
    }
}