async function test() {
  const nodemailer = await import('nodemailer');
  console.log('Nodemailer exports:', Object.keys(nodemailer));
  console.log('Has createTransporter:', typeof nodemailer.createTransporter);
  console.log('Has default:', !!nodemailer.default);
  if (nodemailer.default) {
    console.log('Default exports:', Object.keys(nodemailer.default));
  }
}
test();