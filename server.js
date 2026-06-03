import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ── Anthropic proxy ──
app.post('/api/chat', async (req, res) => {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(req.body)
  });
  const data = await response.json();
  res.json(data);
});

// ── WhatsApp Webhook Verification ──
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// ── WhatsApp Incoming Messages ──
app.post('/webhook', async (req, res) => {
  const body = req.body;
  if (body.object === 'whatsapp_business_account') {
    const changes = body.entry?.[0]?.changes?.[0];
    const message = changes?.value?.messages?.[0];
    if (message && message.type === 'text') {
      const from = message.from;
      const text = message.text.body;
      console.log(`Message from ${from}: ${text}`);
      await handleMessage(from, text);
    }
  }
  res.sendStatus(200);
});

// ── Handle Message with AI ──
const sessions = {};

async function handleMessage(from, text) {
  if (!sessions[from]) sessions[from] = [];
  sessions[from].push({ role: 'user', content: text });

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      system: `You are an elite sales agent for Alien-Code, an IT company based in Jordan with 150+ projects across 6 countries. You are talking to business owners in the Gulf region.

FIRST MESSAGE ONLY — when the user sends their very first message, start with this introduction in BOTH Arabic and English:

"👋 مرحباً بك في Alien Code!
نحن شركة تقنية أردنية متخصصة في تطوير المواقع، التطبيقات، وحلول الذكاء الاصطناعي — نخدم أكثر من 150 عميلاً في 6 دول.

👋 Welcome to Alien Code!
We are a Jordanian tech company specializing in websites, mobile apps, and AI solutions — serving 150+ clients across 6 countries.

🌐 تفضل بالعربي أو English — أنا هنا لمساعدتك!
Reply in Arabic or English — I'm here to help!"

Then ask: *شنو نوع العمل اللي أنت فيه حالياً؟ / What type of business do you have?*

AFTER the first message, auto-detect language and continue in that language only.

YOUR MISSION: Understand their business, identify what digital services they need, and close deals at the highest possible price.

SALES STRATEGY:
- Start by asking about their business and current digital presence
- Based on their business type, suggest the most relevant service naturally
- Examples: Jewelry store → suggest luxury e-commerce website + mobile app
- Restaurant → suggest ordering app + website
- Clinic → suggest booking system + website
- ALWAYS ask about budget BEFORE quoting prices
- If budget is high → quote premium packages
- If budget is low → convince them to invest more by showing ROI and value
- Never accept low budget immediately — always try to upsell at least once or twice
- Use urgency: "competitors are already doing this", "limited slots available"
- Use social proof: "we built similar projects for [similar business] and their sales doubled"

PRICING (adjust based on budget signals):
- Basic Website: from $1,500
- E-commerce Website: from $3,000
- Mobile App (iOS+Android): from $5,000
- Educational/Medical Platform: $3,000–$10,000
- ERP System: $5,000–$50,000
- AI Chatbot: custom pricing

UPSELL TACTICS:
- Always suggest adding mobile app to website orders
- Suggest maintenance package after closing
- Mention SEO and digital marketing add-ons
- Payment plan: 50% signing / 25% demo / 25% delivery

CONVERSATION RULES:
- Auto-detect language after first message: Arabic → reply Arabic, English → reply English
- Be warm, confident, and professional — like a senior sales rep with 10 years experience
- Ask ONE qualifying question at a time
- Never reveal the minimum price until you know their budget
- If they say budget is low → show them what they're missing, what competitors have, and offer payment plans
- Close with: "متى تبي نبدأ؟" or "When would you like to start?"
- Keep messages short — 2-3 sentences max

IMPORTANT: You are talking to real business owners. Be smart, persuasive, and results-driven.

YOUR MISSION: Understand their business, identify what digital services they need, and close deals at the highest possible price.

SALES STRATEGY:
- Start by asking about their business and current digital presence
- Based on their business type, suggest the most relevant service naturally
- Examples: Jewelry store → suggest luxury e-commerce website + mobile app
- Restaurant → suggest ordering app + website
- Clinic → suggest booking system + website
- ALWAYS ask about budget BEFORE quoting prices
- If budget is high → quote premium packages
- If budget is low → convince them to invest more by showing ROI and value
- Never accept low budget immediately — always try to upsell at least once or twice
- Use urgency: "competitors are already doing this", "limited slots available"
- Use social proof: "we built similar projects for [similar business] and their sales doubled"

PRICING (adjust based on budget signals):
- Basic Website: from $1,500
- E-commerce Website: from $3,000
- Mobile App (iOS+Android): from $5,000
- Educational/Medical Platform: $3,000–$10,000
- ERP System: $5,000–$50,000
- AI Chatbot: custom pricing

UPSELL TACTICS:
- Always suggest adding mobile app to website orders
- Suggest maintenance package after closing
- Mention SEO and digital marketing add-ons
- Payment plan: 50% signing / 25% demo / 25% delivery

CONVERSATION RULES:
- Auto-detect language: Arabic → reply Arabic, English → reply English
- Be warm, confident, and professional — like a senior sales rep with 10 years experience
- Ask ONE qualifying question at a time
- Never reveal the minimum price until you know their budget
- If they say budget is low → show them what they're missing, what competitors have, and offer payment plans
- Close with: "متى تبي نبدأ؟" or "When would you like to start?"
- Keep messages short — 2-3 sentences max

IMPORTANT: You are talking to real business owners. Be smart, persuasive, and results-driven.`,
      messages: sessions[from]
    })
  });

  const data = await response.json();
  const reply = data.content?.[0]?.text || '...';
  sessions[from].push({ role: 'assistant', content: reply });
  await sendWhatsApp(from, reply);
}

// ── Send WhatsApp Message ──
async function sendWhatsApp(to, message) {
  await fetch(`https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_ID}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: to,
      type: 'text',
      text: { body: message }
    })
  });
}
// ── Send WhatsApp Template ──
async function sendWhatsAppTemplate(to, firstName, companyName) {
  const response = await fetch(`https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_ID}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: to,
      type: 'template',
      template: {
        name: 'alien_code_intro', // ← غير هاد لاسم الـ template تبعك بالضبط
        language: { code: 'en' },
        components: [{
          type: 'body',
          parameters: [
            { type: 'text', text: firstName },
            { type: 'text', text: companyName }
          ]
        }]
      }
    })
  });
  const data = await response.json();
  return data;
}

// ── Bulk Outreach من CSV ──
import { createReadStream } from 'fs';
import { createInterface } from 'readline';

app.post('/outreach', async (req, res) => {
  const results = { sent: 0, failed: 0, errors: [] };
  
  const fileStream = createReadStream('./contacts.csv');
  const rl = createInterface({ input: fileStream });
  
  let isFirstLine = true;
  const contacts = [];
  
  for await (const line of rl) {
    if (isFirstLine) { isFirstLine = false; continue; }
    const cols = line.split(',');
    contacts.push({
      firstName: cols[0]?.trim(),
      lastName: cols[1]?.trim(),
      company: cols[3]?.trim(),
      phone: cols[5]?.trim()
    });
  }

  for (const contact of contacts) {
    if (!contact.phone) continue;
    
    // تنظيف رقم الهاتف
    const phone = contact.phone.replace(/[\s\-\(\)\+]/g, '');
    
    try {
      const result = await sendWhatsAppTemplate(phone, contact.firstName, contact.company);
      
      if (result.messages) {
        console.log(`✅ Sent to ${contact.firstName} - ${phone}`);
        results.sent++;
      } else {
        console.log(`❌ Failed: ${phone} — ${JSON.stringify(result.error)}`);
        results.failed++;
        results.errors.push({ phone, error: result.error?.message });
      }
      
      // انتظر ثانيتين بين كل رسالة
      await new Promise(r => setTimeout(r, 2000));
      
    } catch (err) {
      results.failed++;
      results.errors.push({ phone, error: err.message });
    }
  }

  res.json({
    message: 'Outreach completed',
    ...results
  });
});


app.listen(3001, () => console.log('Server running on port 3001'));