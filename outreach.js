import dotenv from 'dotenv';
dotenv.config();

const leads = [
  { name: "محل العاب", phone: "962792993545" },
  { name: "محل عطور", phone: "962791019187" },
];

async function sendTemplate(phone) {
  const res = await fetch(
    `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phone,
        type: 'template',
        template: {
          name: 'it_services_intro',
          language: { code: 'en_US' }
        }
      })
    }
  );
  return await res.json();
}

async function sendText(phone, message) {
  const res = await fetch(
    `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phone,
        type: 'text',
        text: { body: message }
      })
    }
  );
  return await res.json();
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const introMessage = `👋 مرحباً بك في Alien Code!
نحن شركة تقنية أردنية متخصصة في تطوير المواقع، التطبيقات، وحلول الذكاء الاصطناعي — نخدم أكثر من 150 عميلاً في 6 دول.

👋 Welcome to Alien Code!
We are a Jordanian tech company specializing in websites, mobile apps, and AI solutions — serving 150+ clients across 6 countries.

🌐 تفضل بالعربي أو English — أنا هنا لمساعدتك!
Reply in Arabic or English — I'm here to help!

*شنو نوع العمل اللي أنت فيه حالياً؟ / What type of business do you have?*`;

async function main() {
  console.log(`بدأ الإرسال — ${leads.length} رقم`);
  for (const lead of leads) {
    // رسالة 1 — Template
    const t = await sendTemplate(lead.phone);
    if (t.messages) {
      console.log(`✅ Template: ${lead.name} (${lead.phone})`);
    } else {
      console.log(`❌ فشل Template: ${lead.name} — ${JSON.stringify(t.error)}`);
      continue;
    }

    // انتظر 3 ثواني
    await sleep(3000);

    // رسالة 2 — النص الافتتاحي
    const m = await sendText(lead.phone, introMessage);
    if (m.messages) {
      console.log(`✅ Intro: ${lead.name}`);
    } else {
      console.log(`❌ فشل Intro: ${lead.name} — ${JSON.stringify(m.error)}`);
    }

    // انتظر 3 ثواني قبل الرقم الجاي
    await sleep(3000);
  }
  console.log('اكتمل الإرسال!');
}

main();