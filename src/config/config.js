import { __dirname } from '../utils.js'
import dotenv from 'dotenv'
dotenv.config({
    override: true,
    path: `${__dirname}/.env`
})

export const config = {
    PORT: process.env.PORT || 3000,
    MONGO_URL: process.env.MONGO_URL,
    TOKENKEY: process.env.TOKENKEY,
    MODE: process.env.MODE || 'production',
    EADMIN: process.env.EADMIN,
    PADMIN: process.env.PADMIN,
    clientID: process.env.clientID,
    clientSecret: process.env.clientSecret,
    callbackURL: process.env.callbackURL,
    UMAILER: process.env.EMAIL_USER,
    PMAILER: process.env.EMAIL_PASS,
    KEY_SECRET_STRIPE: process.env.KEY_SECRET_STRIPE}