import nodemailer from 'nodemailer'
import crypto from 'crypto'

async function createTransporter() {
    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: 'sunderland239770741@gmail.com',
            pass: 'rwoo lmze itoz wnhe'
        },
    })
}

export function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

export async function sendVerificationEmail(email: string, token: string) {
    const transporter = await createTransporter()
    const verificationLink = `http://localhost:8000/api/auth/verify?email=${encodeURIComponent(email)}&token=${token}`;

    const mailOptions = {
        from: '"Online Portal" <onlineportal@example.com>',
        to: email,
        subject: 'Verify Your Email',
        html: `
        <h1>Email Verification</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationLink}">${verificationLink}</a>
        <p>This link will expire in 24 hours.</p>
      `
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if(err){
            console.log('Error sending email: ', err)
        } else {
            console.log('Verification email sent:', info.messageId);
            console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
        }
    });
}