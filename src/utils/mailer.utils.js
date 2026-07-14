import nodemailer from 'nodemailer'
import ENVIRONMENT from "../config/environment.config.js"


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: ENVIRONMENT.GMAIL_USERNAME,
        pass: ENVIRONMENT.GMAIL_PASSWORD
    }
})


export const sendMail = async ({to, subject, html}) => {
    try{
        const response = await transporter.sendMail({
            to,
            subject,
            html
        })
    console.log(response)
    }
    catch(error){
        console.log('Error al enviar el mail', error)
    }

}
