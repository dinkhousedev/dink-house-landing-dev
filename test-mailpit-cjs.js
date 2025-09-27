async function testMailPit() {
  let nodemailer;
  try {
    nodemailer = await import('nodemailer');
  } catch (e) {
    console.error('Failed to import nodemailer:', e);
    return;
  }

  const transporter = nodemailer.default.createTransporter({
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
      from: '"The Dink House" <test@dinkhousepb.com>',
      to: 'contact@dinkhousepb.com',
      subject: 'Test Contact Form Email',
      text: 'This is a test contact form submission',
      html: '<h1>Test Contact Form</h1><p>This is a test contact form submission to MailPit</p>'
    });

    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Preview URL:', nodemailer.default.getTestMessageUrl(info));
    console.log('\n📧 Check MailPit at http://localhost:8025');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Details:', error);
  }
}

testMailPit();