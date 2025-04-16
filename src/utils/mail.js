import Mailgen from 'mailgen'
import nodemailer from 'nodemailer'
import {ApiError} from "./api-error.js"

export const sendMail = async (options) => {


    const mailGenerator = new Mailgen({
        theme: 'default',
        product: {
            name: 'Task Manager',
            link: 'https://mailgen.js/'
        }
    })

    const emailBody = mailGenerator.generate(options.mailgenContent);
    const emailText = mailGenerator.generatePlaintext(options.mailgenContent);

    const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_HOST,
        port: process.env.MAILTRAP_PORT,
        secure: false, // true for port 465, false for other ports
        auth: {
          user: process.env.MAILTRAP_USER,
          pass: process.env.MAILTRAP_PASSWORD,
        },
      });

      try {
        const info = await transporter.sendMail({
            from: process.env.MYMAIL, 
            to: options.email, 
            subject: options.subject, 
            text: emailText, 
            html: emailBody, 
          });

      } catch (error) {
        throw new ApiError(500,`Error while sending email. : ${error}`)
      }


}

export const emailVerificationMailGenContent = (username,verificationUrl)=>{
    return {
        body:{
            name:username,
            intro:"Wellcome to App! We are very excited to have you on Board.",
            action: {
                instructions: 'To get started with our app, please click here:',
                button: {
                    color: '#22BC66', // Optional action button color
                    text: 'Vrrifiy your email.',
                    link: verificationUrl,
                }
            },
            outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
        }
    }
}

export const forgetPasswordMailGenContent = (username,verificationUrl)=>{
    return {
        body:{
            name:username,
            intro:"Wellcome Back to our App!We are helping to reset Your password.",
            action: {
                instructions: 'To reset your password , please click here:',
                button: {
                    color: '#22BC66', // Optional action button color
                    text: 'Reset your password.',
                    link: verificationUrl,
                }
            },
            outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
        }
    }
}



