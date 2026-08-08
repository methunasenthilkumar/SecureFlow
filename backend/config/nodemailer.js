const nodemailer = require('nodemailer');

const createTransporter = () => {
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.EMAIL_PORT || '587');
  const user = process.env.EMAIL_USER || '';
  const pass = process.env.EMAIL_PASS || '';

  if (!user || !pass) {
    return {
      sendMail: async (options) => {
        console.log(`[MOCK EMAIL SENT] To: ${options.to} | Subject: ${options.subject}`);
        return { messageId: 'mock-id-' + Date.now() };
      }
    };
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
};

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'UPIShield Security'}" <${process.env.EMAIL_USER || 'no-reply@upishield.com'}>`,
      to,
      subject,
      text,
      html
    });
    return info;
  } catch (error) {
    console.error('Email Dispatch Error:', error.message);
    return null;
  }
};

module.exports = sendEmail;
