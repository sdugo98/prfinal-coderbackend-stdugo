import nodemailer from 'nodemailer'
import {config} from '../config/config.js'

const transport = nodemailer.createTransport(
    {
        service: 'gmail',
        port: 587,
        auth: {
            user: config.UMAILER,
            pass: config.PMAILER
        }
    }
)

export const sendMail = (to, subject, message)=>{
    return transport.sendMail(
        {
            to, subject,
            html: message
        }
    )
}