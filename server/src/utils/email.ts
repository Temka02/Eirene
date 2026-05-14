import nodemailer from 'nodemailer';
import logger from './logger';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendDeadlineEmail = async (
  to: string,
  taskTitle: string,
  deadline: Date,
  projectName?: string
) => {
  try {
    const deadlineFormatted = deadline.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject: `Напоминание: дедлайн задачи "${taskTitle}"`,
      text: `Напоминание: у вас есть задача "${taskTitle}" с дедлайном ${deadlineFormatted}.`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              margin: 0;
              padding: 0;
              color: #2F3A34;
              background-color: #fff;
            }
            .wrapper {
              max-width: 32rem;
              margin: 0 auto;
              padding: 1.5rem;
            }
            .card {
              background: #fff;
              border-radius: 1rem;
              padding: 1.25rem;
              box-shadow: 0 6px 20px 0 rgba(0,0,0,0.05);
            }
            .title {
              font-size: 1rem;
              font-weight: 600;
              margin: 0 0 0.75rem 0;
              color: #2F3A34;
            }
            .meta {
              font-size: 0.875rem;
              color: #6F7D75;
              margin: 0.5rem 0;
            }
            .highlight {
              font-weight: 600;
              color: #2F3A34;
            }
            .footer {
              font-size: 0.75rem;
              color: #6F7D75;
              margin-top: 1.5rem;
              padding-top: 1rem;
              border-top: 1px solid #F0F1F2;
            }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="card">
              <h1 class="title">Напоминание о дедлайне</h1>
              
              ${projectName ? `<p class="meta">Проект: <span class="highlight">${projectName}</span></p>` : ''}
              
              <p class="meta">
                Задача: <span class="highlight">"${taskTitle}"</span>
              </p>
              <p class="meta">
                Дедлайн: <span class="highlight">${deadlineFormatted}</span>
              </p>
              
              <div class="footer">
                Это письмо отправлено автоматически. Не отвечайте на него.
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return true;
  } catch (error) {
    logger.error('Failed to send email:', error);
    return false;
  }
};
