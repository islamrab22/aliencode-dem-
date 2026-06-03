import dotenv from 'dotenv';
dotenv.config();

const del = await fetch(
  `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_WABA_ID}/message_templates?name=ac_outreach2`,
  {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}` }
  }
);
console.log('Delete:', await del.json());

const res = await fetch(
  `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_WABA_ID}/message_templates`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`
    },
    body: JSON.stringify({
      name: 'it_services_intro',
      language: 'en_US',
      category: 'MARKETING',
      components: [{
        type: 'BODY',
        text: 'Hi! We specialize in websites, mobile apps, and digital solutions for businesses. Would you like to learn more about how we can help you grow online?'
      }]
    })
  }
);
console.log('Create:', JSON.stringify(await res.json(), null, 2));

const check = await fetch(
  `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_WABA_ID}/message_templates?name=it_services_intro`,
  {
    headers: { 'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}` }
  }
);
const checkData = await check.json();
const status = checkData?.data?.[0]?.status ?? 'NOT FOUND';
console.log('\n📊 حالة it_services_intro:', status);