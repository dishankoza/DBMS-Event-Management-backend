import httpStatus from 'http-status';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import { getTransporter } from '../../../shared/transporter';
import { IMail } from './mail.interface';

const sendMail = async (data: IMail) => {
  const transporter = getTransporter();

  const mailOptions = {
    from: data.email,
    to: config.email.to_email,
    subject: `New message from Eventify by - ${data.name}`,
    html: `
      <h1>New message from Eventify</h1>
      <p><strong>User Name:</strong> ${data.name}</p>
      <p><strong>User Email:</strong> ${data.email}</p>
      <p><strong>Phone:</strong> ${data.phone}</p>
      <p><strong>Source:</strong> ${data.source}</p>
      <p><strong>Message:</strong> ${data.message}</p>
    `,
  };
  const info = await transporter.sendMail(mailOptions);
  if (!info) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Email not sent');
  }
  if (info.messageId) {
    // send auto reply to user
    const mailOptions = {
      from: config.email.to_email,
      to: data.email,
      subject: `Thank you for contacting Eventify`,
      html: `
        <h1>Thank you for contacting Eventify ${data.name}</h1>
        <p>We will get back to you as soon as possible.</p>
        <p>Regards,</p>
        <p>Eventify Team</p>
      `,
    };
    const info = await transporter.sendMail(mailOptions);
    if (!info) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Email not sent');
    }

    return { sent: true };
  }
};

export const MailService = { sendMail };
