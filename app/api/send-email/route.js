// app/api/send-email/route.js
import { NextResponse } from 'next/server';
const Mailjet = require('node-mailjet');

export async function POST(request) {
  const { email, name } = await request.json();

  const mailjet = Mailjet.apiConnect(
    process.env.MAILJET_API_KEY,
    process.env.MAILJET_API_SECRET
  );

  // Email template with logo and better design
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://www.bayangidafarms.com/images/image.png" alt="Bayangida Farms Logo" style="max-width: 150px; height: auto;">
      </div>
      <h2 style="color: #333; text-align: center;">Welcome to Bayangida Farms!</h2>
      <p style="color: #555; font-size: 16px; line-height: 1.6;">
        Hi ${name},
      </p>
      <p style="color: #555; font-size: 16px; line-height: 1.6;">
        Thank you for joining the Bayangida Farms waitlist! We have received your submission and will keep you updated with the latest news and updates.
      </p>
      <p style="color: #555; font-size: 16px; line-height: 1.6;">
        If you have any questions, feel free to reply to this email. We're here to help!
      </p>
      <p style="color: #555; font-size: 16px; line-height: 1.6;">
        Best regards,<br>
        <strong>The Bayangida Farms Marketing Team</strong>
      </p>
      <div style="text-align: center; margin-top: 30px; font-size: 14px; color: #888;">
        <p>Bayangida Farms &copy; ${new Date().getFullYear()}</p>
        <p><a href="https://www.bayangidafarms.com/" style="color: #007bff; text-decoration: none;">Visit our website</a></p>
      </div>
    </div>
  `;

  const emailRequest = mailjet.post('send', { version: 'v3.1' }).request({
    Messages: [
      {
        From: {
          Email: process.env.EMAIL_FROM,
          Name: 'Bayangida Farms',
        },
        To: [
          {
            Email: email,
            Name: name,
          },
        ],
        Subject: 'Welcome to Bayangida Farms!',
        TextPart: `Hi ${name},\n\nThank you for joining the Bayangida Farms waitlist! We have received your submission and will keep you updated.\n\nBest regards,\nThe Bayangida Farms Marketing Team`,
        HTMLPart: emailHtml,
      },
    ],
  });

  try {
    await emailRequest;
    return NextResponse.json({ message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
