import nodemailer from 'nodemailer';
export function getMailer() {
  const host = process.env.SMTP_HOST;
  if (!host) return null;
  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}
export async function sendResetEmail(to: string, resetUrl: string) {
  const transporter = getMailer();
  if (!transporter) { console.warn('SMTP not configured; reset link:', resetUrl); return; }
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'no-reply@mymotorcyclerides.com',
    to,
    subject: 'Reset your password',
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6"><h2>Reset your password</h2><p><a href="${resetUrl}">${resetUrl}</a></p></div>`,
  });
}
