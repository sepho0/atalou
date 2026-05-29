/**
 * payroll-quote-backend.js — Atalou Atapayroll
 * ══════════════════════════════════════════════
 * Ce fichier fait 3 choses quand un formulaire est soumis :
 *  1. Envoie un email au prospect avec le lien démo
 *  2. Envoie un email interne à ton équipe
 *  3. Enregistre les données dans Google Sheets
 *
 * ── Installation ──
 *   npm install express nodemailer cors dotenv googleapis
 *
 * ── Fichier .env à créer ──
 *   SMTP_HOST=smtp.gmail.com
 *   SMTP_PORT=587
 *   SMTP_USER=info@atalou.com
 *   SMTP_PASS=xxxx_xxxx_xxxx_xxxx
 *   NOTIFY_EMAIL=info@atalou.com
 *   GOOGLE_SHEET_ID=1AbCdEf...
 *   GOOGLE_CLIENT_EMAIL=atalou-bot@projet.iam.gserviceaccount.com
 *   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
 *   PORT=3000
 *
 * ── Démarrage ──
 *   node payroll-quote-backend.js
 */

'use strict';
require('dotenv').config();

const express    = require('express');
const nodemailer = require('nodemailer');
const cors       = require('cors');
const { google } = require('googleapis');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({ origin: '*' }));

/* ════════════════════════════════════════
   NODEMAILER — configuration emails
   ════════════════════════════════════════ */
const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST || 'smtp.gmail.com',
  port:   Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/* ════════════════════════════════════════
   GOOGLE SHEETS — configuration
   ════════════════════════════════════════ */
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key:  process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

/* ════════════════════════════════════════
   UTILITAIRES
   ════════════════════════════════════════ */
const TIERS = {
  small:       'Small Business (1-5 employes)',
  growing:     'Growing Business (6-25 employes)',
  established: 'Established Company (26-100 employes)',
  enterprise:  'Enterprise Solutions (100+ employes)',
};

function esc(str) {
  return String(str || '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function now() {
  return new Date().toLocaleString('fr-HT', {
    timeZone:  'America/Port-au-Prince',
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

/* ════════════════════════════════════════
   FONCTION — Sauvegarder dans Google Sheets
   ════════════════════════════════════════
   Colonnes du sheet "Leads" :
   A=Date | B=Nom | C=Email | D=Tel | E=Societe | F=Employes | G=Plan | H=Secteur | I=Message
   ════════════════════════════════════════ */
async function saveToSheet(data) {
  const { name, email, phone, company, qty, sector, message, tier, range } = data;
  await sheets.spreadsheets.values.append({
    spreadsheetId:    process.env.GOOGLE_SHEET_ID,
    range:            'Leads!A:I',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        now(),
        name,
        email,
        phone,
        company,
        qty,
        TIERS[tier] || range || tier,
        sector  || '-',
        message || '-',
      ]],
    },
  });
}

/* ════════════════════════════════════════
   ROUTE — POST /api/payroll-quote
   ════════════════════════════════════════ */
app.post('/api/payroll-quote', async (req, res) => {
  const {
    name, email, phone, company,
    qty, sector, message,
    tier, range,
    demoLink = 'https://atalou.com/demo.html',
  } = req.body;

  if (!name || !email || !phone || !company || !qty) {
    return res.status(400).json({ error: 'Champs obligatoires manquants.' });
  }

  const tierLabel = TIERS[tier] || range || 'Non precis';

  /* Email au prospect */
  const mailProspect = {
    from:    `"Atalou Microsystem" <${process.env.SMTP_USER}>`,
    to:      email,
    subject: 'Votre lien de demonstration Atapayroll est pret !',
    html: `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0a1628;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;margin:0 auto;background:#0f2040;border-radius:16px;overflow:hidden;">
  <tr><td style="background:#0a2545;padding:24px 32px;text-align:center;">
    <img src="https://atalou.com/image/LOGO2.png" alt="Atalou" height="36">
  </td></tr>
  <tr><td style="padding:36px 32px;">
    <h1 style="margin:0 0 10px;color:#fff;font-size:22px;font-weight:700;">Bonjour ${esc(name)} !</h1>
    <p style="color:#7f92b5;font-size:14px;line-height:1.65;margin:0 0 22px;">
      Merci pour votre interet pour <strong style="color:#36ECDE;">Atapayroll</strong>.
    </p>
    <div style="background:#112244;border-radius:12px;padding:18px 22px;margin-bottom:24px;border:1px solid rgba(54,236,222,0.2);">
      <p style="margin:0 0 5px;font-size:10px;font-weight:700;text-transform:uppercase;color:#36ECDE;">Plan selectionne</p>
      <p style="margin:0;color:#fff;font-size:1rem;font-weight:700;">${esc(tierLabel)}</p>
      <p style="margin:4px 0 0;color:#7f92b5;font-size:13px;">${esc(company)} - ${esc(qty)} employes</p>
    </div>
    <div style="text-align:center;margin:0 0 24px;">
      <a href="${esc(demoLink)}" target="_blank"
         style="display:inline-block;background:#36ECDE;color:#0a1628;text-decoration:none;
                padding:14px 36px;border-radius:10px;font-weight:700;font-size:0.95rem;">
        Acceder a la demonstration
      </a>
    </div>
    <p style="color:#7f92b5;font-size:13px;line-height:1.6;margin:0;">
      Notre equipe vous contactera dans les <strong style="color:#cdd6f4;">24 heures</strong>.
    </p>
  </td></tr>
  <tr><td style="background:#0a1628;padding:18px 32px;text-align:center;">
    <p style="margin:0;color:#4a5a7a;font-size:12px;">
      ${new Date().getFullYear()} Atalou Microsystem - Port-au-Prince, Haiti |
      <a href="https://atalou.com" style="color:#36ECDE;text-decoration:none;">atalou.com</a>
    </p>
  </td></tr>
</table>
</body></html>`,
  };

  /* Email interne */
  const mailInterne = {
    from:    `"Atalou Quote Bot" <${process.env.SMTP_USER}>`,
    to:      process.env.NOTIFY_EMAIL || process.env.SMTP_USER,
    subject: `Nouveau devis - ${company} - ${tierLabel}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:500px;">
  <h2 style="color:#0a1628;">Nouveau devis recu</h2>
  <table style="border-collapse:collapse;font-size:14px;width:100%;">
    <tr style="background:#f0f4ff;"><td style="padding:8px 12px;font-weight:600;width:130px;">Date</td><td style="padding:8px 12px;">${now()}</td></tr>
    <tr><td style="padding:8px 12px;font-weight:600;">Nom</td><td style="padding:8px 12px;">${esc(name)}</td></tr>
    <tr style="background:#f0f4ff;"><td style="padding:8px 12px;font-weight:600;">Email</td><td style="padding:8px 12px;"><a href="mailto:${esc(email)}">${esc(email)}</a></td></tr>
    <tr><td style="padding:8px 12px;font-weight:600;">Telephone</td><td style="padding:8px 12px;">${esc(phone)}</td></tr>
    <tr style="background:#f0f4ff;"><td style="padding:8px 12px;font-weight:600;">Societe</td><td style="padding:8px 12px;">${esc(company)}</td></tr>
    <tr><td style="padding:8px 12px;font-weight:600;">Employes</td><td style="padding:8px 12px;">${esc(qty)}</td></tr>
    <tr style="background:#f0f4ff;"><td style="padding:8px 12px;font-weight:600;">Plan</td><td style="padding:8px 12px;font-weight:700;">${esc(tierLabel)}</td></tr>
    <tr><td style="padding:8px 12px;font-weight:600;">Secteur</td><td style="padding:8px 12px;">${esc(sector || '-')}</td></tr>
    <tr style="background:#f0f4ff;"><td style="padding:8px 12px;font-weight:600;">Message</td><td style="padding:8px 12px;">${esc(message || '-')}</td></tr>
  </table>
  <p style="margin-top:16px;font-size:13px;color:#888;">Ces donnees ont ete enregistrees dans Google Sheets.</p>
</div>`,
  };

  /* Lancer les 3 actions en parallele */
  const results = await Promise.allSettled([
    transporter.sendMail(mailProspect),   // [0] email prospect
    transporter.sendMail(mailInterne),    // [1] email equipe
    saveToSheet({ name, email, phone, company, qty, sector, message, tier, range }), // [2] sheets
  ]);

  const labels = ['Email prospect', 'Email interne', 'Google Sheets'];
  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      console.error(`[${labels[i]}] ERREUR:`, r.reason?.message);
    } else {
      console.log(`[${labels[i]}] OK`);
    }
  });

  if (results[0].status === 'rejected') {
    return res.status(500).json({ error: 'Echec envoi email prospect.' });
  }

  return res.json({
    success:    true,
    sheetSaved: results[2].status === 'fulfilled',
  });
});

app.listen(PORT, () => {
  console.log(`[Atalou Backend] http://localhost:${PORT}`);
});