const fs = require('fs');
const csv = require('csv-parse/sync');
const nodemailer = require('nodemailer');

// إعداد الإيميل - غير البيانات هون
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // App Password مو الباسورد العادي
  }
});

// قراءة الـ CSV
const fileContent = fs.readFileSync('./contacts.csv', 'utf-8');
const contacts = csv.parse(fileContent, {
  columns: true,
  skip_empty_lines: true
});

// رسالة مخصصة لكل شخص
function buildEmail(contact) {
  const firstName = contact['First Name'];
  const company = contact['Company Name'];
  
  return {
    subject: `Partnership Opportunity – IT Solutions for ${company}`,
    html: `
      <p>Dear ${firstName},</p>
      
      <p>My name is Islam, representing <strong>Alien-Code</strong> — an IT company with offices in Jordan, Egypt & Turkey, serving clients across 6 countries.</p>
      
      <p>We specialize in:</p>
      <ul>
        <li>📱 Mobile & Web Applications</li>
        <li>🏥 Medical & Educational Platforms</li>
        <li>🤖 AI Chatbots & Automation</li>
        <li>📊 ERP Systems</li>
      </ul>
      
      <p>I'd love to explore how we can support <strong>${company}</strong>'s digital growth.</p>
      
      <p>Would you be open to a quick 15-minute call this week?</p>
      
      <p>Best regards,<br>
      <strong>Islam</strong><br>
      Alien-Code | aliencode.com</p>
    `
  };
}

// إرسال الإيميلات
async function sendEmails() {
  let sent = 0;
  let failed = 0;

  for (const contact of contacts) {
    const email = contact['Email'];
    if (!email) continue;

    const { subject, html } = buildEmail(contact);

    try {
      await transporter.sendMail({
        from: `"Alien-Code" <${process.env.EMAIL_USER}>`,
        to: email,
        subject,
        html
      });
      
      console.log(`✅ Sent to: ${email}`);
      sent++;
      
      // انتظر 3 ثواني بين كل إيميل عشان ما يحجبك Gmail
      await new Promise(r => setTimeout(r, 3000));
      
    } catch (err) {
      console.log(`❌ Failed: ${email} — ${err.message}`);
      failed++;
    }
  }

  console.log(`\n📊 Done! Sent: ${sent} | Failed: ${failed}`);
}

sendEmails();