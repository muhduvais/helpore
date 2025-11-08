import nodemailer from 'nodemailer';

export const sendOtpEmail = async (email: string, otp: string) => {
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.OTP_EMAIL,
            pass: process.env.OTP_PASSWORD
        }
    });

    const mailOptions = {
        from: process.env.OTP_EMAIL,
        to: email,
        subject: 'Your OTP Verification Code',
        text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Mail sent successfully!');
        return true;
    } catch (error) {
        console.log('Error sending otp:', error);
        return false;
    }
}
