import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
) => {

  console.log(
    'SMTP_HOST:',
    process.env.SMTP_HOST
  );
  
  console.log(
    'SMTP_PORT:',
    process.env.SMTP_PORT
  );
  
  console.log(
    'SMTP_USER:',
    process.env.SMTP_USER
  );

  const transporter =
    nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(
        process.env.SMTP_PORT
      ),
      secure: false,
      auth: {
        user:
          process.env.SMTP_USER,
        pass:
          process.env.SMTP_PASS,
      },
    });

    const info =
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      html,
    });
  
  console.log(
    'EMAIL SENT:',
    info
  );

};