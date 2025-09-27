async function testMailPit() {
  const nodemailer = await import('nodemailer');

  const transporter = nodemailer.default.createTransport({
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
      from: '"The Dink House" <noreply@dinkhousepb.com>',
      to: 'contact@dinkhousepb.com',
      subject: 'Test Contact Form Email from API',
      text: 'This is a test contact form submission',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #CDFE00 0%, #9BCF00 100%); padding: 20px; text-align: center;">
            <h1 style="color: white;">The Dink House</h1>
          </div>
          <div style="padding: 20px; background: #f9f9f9;">
            <h2>Test Contact Form Submission</h2>
            <p><strong>Name:</strong> Test User</p>
            <p><strong>Email:</strong> test@example.com</p>
            <p><strong>Message:</strong> This is a test message to verify MailPit integration is working correctly.</p>
          </div>
        </div>
      `
    });

    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Accepted:', info.accepted);
    console.log('\n📧 Check MailPit at http://localhost:8025');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠️  Cannot connect to MailPit. Make sure MailPit is running on localhost:1025');
      console.error('   You can check if MailPit is running with: docker ps | grep mailpit');
    }
  }
}

testMailPit();