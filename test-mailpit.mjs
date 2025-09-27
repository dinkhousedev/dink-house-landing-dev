import nodemailer from 'nodemailer';

async function testMailPit() {
  const transporter = nodemailer.createTransporter({
    host: 'localhost',
    port: 1025,
    secure: false,
    ignoreTLS: true
  });

  try {
    // Verify connection
    await transporter.verify();
    console.log('✅ MailPit connection successful!');

    // Send test email
    const info = await transporter.sendMail({
      from: '"Test Sender" <test@example.com>',
      to: 'recipient@example.com',
      subject: 'Test Email from Node.js',
      text: 'This is a test email',
      html: '<b>This is a test email</b>'
    });

    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Check MailPit at http://localhost:8025');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testMailPit();