import { chatsModel } from "../dao/models/chatsModel.js";

export class ChatDAO{
    constructor(){}
    async saveMessage(datos){
        try {
            
            let userInCollection = await chatsModel.findOne({user: datos.user}) 
            if(userInCollection){
                userInCollection.message.push(datos.message)
                await chatsModel.updateOne({user: datos.user}, {message: userInCollection.message})
                return datos
            }
            await chatsModel.create({ user: datos.user, message: [datos.message] });
            return datos
        } catch (error) {
            return null
        }
        }
    }
