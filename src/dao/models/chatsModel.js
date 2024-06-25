import mongoose from 'mongoose';

export const chatsModel = mongoose.model('messages', new mongoose.Schema({
    user: { type: String, unique: true, required: true },
    message: []
}))