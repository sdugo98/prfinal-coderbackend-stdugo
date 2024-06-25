import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
    {
        code: {},
        amount: Number,
        purchaser: String
    },
    {
        timestamps: {
            updatedAt:
                'DateUltimateMod',
            createdAt: 'DateOn'
        }
    },
    {
        strict: false
    }
)

export const ticketsModel = mongoose.model('tickets', ticketSchema)