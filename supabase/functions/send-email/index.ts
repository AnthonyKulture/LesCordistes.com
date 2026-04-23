import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Resend } from 'npm:resend@3.2.0';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ─── Brand ────────────────────────────────────────────────────────────────────
const B = '#243355';       // brand blue
const BL = '#5B8DDB';      // brand blue light
const S7 = '#334155';      // slate-700
const S5 = '#64748b';      // slate-500
const S4 = '#94a3b8';      // slate-400
const S2 = '#e2e8f0';      // slate-200
const S1 = '#f1f5f9';      // slate-100

// ─── Base layout ──────────────────────────────────────────────────────────────
function base(previewText: string, content: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${previewText}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Inter,Arial,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;">${previewText}</div>

<!-- Header -->
<table width="100%" cellpadding="0" cellspacing="0" style="background:${B};">
  <tr><td align="center" style="padding:24px 40px;">
    <a href="https://lescordistes.com" style="text-decoration:none;">
      <span style="font-family:Inter,Arial,sans-serif;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">Les<span style="color:${BL};">Cordistes</span><span style="color:#ffffff;opacity:0.6;">.com</span></span>
    </a>
  </td></tr>
</table>

<!-- Body -->
<table width="100%" cellpadding="0" cellspacing="0">
  <tr><td align="center" style="padding:0 16px;">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;max-width:600px;width:100%;padding:40px 40px 48px;">
      <tr><td>
        ${content}
      </td></tr>
    </table>
  </td></tr>
</table>

<!-- Footer -->
<table width="100%" cellpadding="0" cellspacing="0">
  <tr><td align="center" style="padding:24px 40px 40px;">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
      <tr><td>
        <hr style="border:none;border-top:1px solid ${S2};margin:0 0 20px;"/>
        <p style="font-size:12px;color:${S4};text-align:center;margin:0 0 8px;line-height:18px;">
          © 2026 LesCordistes.com — Le réseau n°1 des travaux en hauteur
        </p>
        <p style="font-size:12px;color:${S4};text-align:center;margin:0;line-height:18px;">
          <a href="https://lescordistes.com" style="color:${BL};text-decoration:none;">Visiter le site</a>
          &nbsp;·&nbsp;
          <a href="https://lescordistes.com/dashboard" style="color:${BL};text-decoration:none;">Mon espace</a>
          &nbsp;·&nbsp;
          <a href="mailto:anthony@lescordistes.com" style="color:${BL};text-decoration:none;">Nous contacter</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>

</body></html>`;
}

function btn(href: string, label: string): string {
  return `<table cellpadding="0" cellspacing="0" style="margin:28px 0 0;">
    <tr><td style="background:${B};border-radius:6px;">
      <a href="${href}" style="display:block;padding:14px 28px;color:#fff;font-size:15px;font-weight:600;text-decoration:none;text-align:center;">${label}</a>
    </td></tr>
  </table>`;
}

function badge(color: string, bgColor: string, borderColor: string, label: string): string {
  return `<div style="background:${bgColor};border-left:4px solid ${borderColor};border-radius:0 6px 6px 0;padding:14px 18px;margin:0 0 28px;">
    <p style="font-size:12px;font-weight:700;color:${color};margin:0;text-transform:uppercase;letter-spacing:0.05em;">${label}</p>
  </div>`;
}

// ─── Templates ────────────────────────────────────────────────────────────────

function welcomeClient(data: Record<string, string>): string {
  const name = data.name || '';
  return base(`Bienvenue sur LesCordistes.com, ${name}`, `
    <h1 style="font-size:22px;font-weight:700;color:${B};margin:0 0 8px;line-height:30px;">Bienvenue sur LesCordistes.com</h1>
    <p style="font-size:15px;color:${S5};margin:0 0 28px;">Bonjour ${name},</p>
    <p style="font-size:15px;color:${S7};line-height:24px;margin:0 0 28px;">
      Votre compte client est actif. Vous pouvez dès maintenant publier vos chantiers et recevoir des devis de professionnels qualifiés en travaux sur cordes partout en France.
    </p>
    <div style="background:${S1};border-radius:8px;padding:24px;margin:0 0 28px;">
      <p style="font-size:13px;font-weight:600;color:${B};margin:0 0 16px;text-transform:uppercase;letter-spacing:0.05em;">Comment ça marche</p>
      <p style="font-size:14px;color:${S7};margin:0 0 10px;line-height:20px;"><span style="color:${BL};font-weight:700;">1.</span> <strong>Décrivez votre projet</strong> — localisation, type de travaux, délai</p>
      <p style="font-size:14px;color:${S7};margin:0 0 10px;line-height:20px;"><span style="color:${BL};font-weight:700;">2.</span> <strong>Les pros vous contactent</strong> — cordistes certifiés de votre secteur</p>
      <p style="font-size:14px;color:${S7};margin:0;line-height:20px;"><span style="color:${BL};font-weight:700;">3.</span> <strong>Choisissez le meilleur profil</strong> — comparez, échangez, décidez</p>
    </div>
    ${btn('https://lescordistes.com/post-job', 'Publier mon premier projet')}
    <hr style="border:none;border-top:1px solid ${S2};margin:28px 0;"/>
    <p style="font-size:13px;color:${S5};margin:0;line-height:20px;">Une question ? Répondez directement à cet email, notre équipe vous répond sous 24h.</p>
  `);
}

function welcomePro(data: Record<string, string>): string {
  const name = data.name || '';
  return base(`Votre profil pro est actif — ${name}`, `
    <h1 style="font-size:22px;font-weight:700;color:${B};margin:0 0 8px;line-height:30px;">Votre profil pro est actif</h1>
    <p style="font-size:15px;color:${S5};margin:0 0 28px;">Bonjour ${name},</p>
    <p style="font-size:15px;color:${S7};line-height:24px;margin:0 0 28px;">
      Bienvenue sur <strong>LesCordistes.com</strong>, le réseau de référence pour les techniciens en travaux sur cordes. Des centaines de missions sont publiées chaque mois par des clients partout en France.
    </p>
    <div style="background:${S1};border-radius:8px;padding:24px;margin:0 0 28px;">
      <p style="font-size:13px;font-weight:600;color:${B};margin:0 0 16px;text-transform:uppercase;letter-spacing:0.05em;">Maximisez vos chances</p>
      <p style="font-size:14px;color:${S7};margin:0 0 10px;line-height:20px;"><span style="color:${BL};font-weight:700;">1.</span> <strong>Complétez votre profil</strong> — certifications IRATA, CQP, photos de réalisations</p>
      <p style="font-size:14px;color:${S7};margin:0 0 10px;line-height:20px;"><span style="color:${BL};font-weight:700;">2.</span> <strong>Renseignez vos zones d'intervention</strong> — recevez des alertes missions ciblées</p>
      <p style="font-size:14px;color:${S7};margin:0;line-height:20px;"><span style="color:${BL};font-weight:700;">3.</span> <strong>Débloquez les leads</strong> — contactez les clients directement</p>
    </div>
    ${btn('https://lescordistes.com/dashboard/pro', 'Compléter mon profil')}
    <hr style="border:none;border-top:1px solid ${S2};margin:28px 0;"/>
    <p style="font-size:13px;color:${S5};margin:0;line-height:20px;">Les profils complets reçoivent en moyenne 3x plus de contacts clients.</p>
  `);
}

function adminAlert(data: Record<string, string>): string {
  return base(`Action requise — ${data.title}`, `
    ${badge(BL, '#eff6ff', BL, 'Notification Admin')}
    <p style="font-size:14px;font-weight:600;color:${B};margin:-14px 0 28px 0;padding-left:22px;">${data.title}</p>
    <p style="font-size:15px;color:${S7};line-height:24px;margin:0 0 28px;">${data.message}</p>
    ${btn(data.link, data.linkText)}
    <hr style="border:none;border-top:1px solid ${S2};margin:28px 0;"/>
    <p style="font-size:13px;color:${S5};margin:0;">Notification automatique — LesCordistes.com</p>
  `);
}

function jobStatus(data: Record<string, string>): string {
  const isApproved = data.status === 'live';
  const bgColor = isApproved ? '#f0fdf4' : '#fef2f2';
  const borderColor = isApproved ? '#16a34a' : '#dc2626';
  const textColor = isApproved ? '#15803d' : '#b91c1c';
  const statusLabel = isApproved ? 'Projet approuvé et publié' : 'Publication refusée';
  const title = isApproved ? 'Votre projet est en ligne !' : "Votre projet n'a pas été publié";
  return base(title, `
    ${badge(textColor, bgColor, borderColor, statusLabel)}
    <h1 style="font-size:22px;font-weight:700;color:${B};margin:0 0 8px;line-height:30px;">${title}</h1>
    <p style="font-size:15px;color:${S5};margin:0 0 24px;">Bonjour ${data.name},</p>
    <div style="background:${S1};border-radius:8px;padding:16px 20px;margin:0 0 24px;">
      <p style="font-size:12px;color:${S5};margin:0 0 4px;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;">Projet concerné</p>
      <p style="font-size:16px;font-weight:600;color:${B};margin:0;">${data.jobTitle}</p>
    </div>
    ${isApproved
      ? `<p style="font-size:15px;color:${S7};line-height:24px;margin:0 0 28px;">Votre projet a été validé et est désormais visible par l'ensemble des professionnels du réseau.</p>`
      : `<p style="font-size:15px;color:${S7};line-height:24px;margin:0 0 20px;">Notre équipe n'a pas pu valider votre projet en l'état. Vous pouvez le modifier et le soumettre à nouveau.</p>
         ${data.rejectionReason ? `<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px 20px;margin:0 0 28px;"><p style="font-size:13px;font-weight:600;color:#b91c1c;margin:0 0 6px;text-transform:uppercase;letter-spacing:0.05em;">Motif</p><p style="font-size:14px;color:#7f1d1d;margin:0;line-height:21px;">${data.rejectionReason}</p></div>` : ''}`
    }
    ${btn('https://lescordistes.com/dashboard/client', isApproved ? 'Voir mon tableau de bord' : 'Modifier mon projet')}
    <hr style="border:none;border-top:1px solid ${S2};margin:28px 0;"/>
    <p style="font-size:13px;color:${S5};margin:0;">Une question ? <a href="mailto:anthony@lescordistes.com" style="color:${BL};text-decoration:none;">anthony@lescordistes.com</a></p>
  `);
}

function matchJob(data: Record<string, string | boolean>): string {
  const isRenfort = data.isRenfort === true || data.isRenfort === 'true';
  return base(`Nouvelle mission — ${data.jobTitle} à ${data.location}`, `
    ${badge(BL, '#eff6ff', BL, isRenfort ? 'Mission Renfort PRO' : 'Nouvelle mission')}
    <h1 style="font-size:22px;font-weight:700;color:${B};margin:0 0 8px;line-height:30px;">Mission disponible près de chez vous</h1>
    <p style="font-size:15px;color:${S5};margin:0 0 24px;">Bonjour ${data.proName},</p>
    <p style="font-size:15px;color:${S7};line-height:24px;margin:0 0 24px;">
      Une nouvelle mission${isRenfort ? ' de renfort professionnel' : ''} vient d'être publiée dans votre secteur.
    </p>
    <div style="background:${S1};border-radius:8px;padding:20px 24px;margin:0 0 28px;">
      <p style="font-size:18px;font-weight:700;color:${B};margin:0 0 10px;line-height:26px;">${data.jobTitle}</p>
      <p style="font-size:14px;color:${S5};margin:0;"><span style="color:${S7};font-weight:600;">Lieu :</span> ${data.location}</p>
    </div>
    ${btn(`https://lescordistes.com/jobs/${data.jobSlug || data.jobId}`, 'Voir les détails de la mission')}
    <hr style="border:none;border-top:1px solid ${S2};margin:28px 0;"/>
    <p style="font-size:13px;color:${S5};margin:0;line-height:20px;">Les meilleures missions sont souvent débloquées rapidement. Agissez vite !</p>
  `);
}

function paymentReceipt(data: Record<string, string | number>): string {
  return base(`Reçu de paiement — Pack ${data.packName}`, `
    ${badge('#15803d', '#f0fdf4', '#16a34a', 'Paiement confirmé')}
    <h1 style="font-size:22px;font-weight:700;color:${B};margin:0 0 8px;line-height:30px;">Votre achat a bien été enregistré</h1>
    <p style="font-size:15px;color:${S5};margin:0 0 24px;">Bonjour ${data.name},</p>
    <p style="font-size:15px;color:${S7};line-height:24px;margin:0 0 28px;">
      Merci pour votre achat. Vos crédits ont été ajoutés à votre compte et sont immédiatement disponibles.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${S2};border-radius:8px;margin:0 0 28px;">
      <tr><td style="background:#f8fafc;padding:14px 20px;border-bottom:1px solid ${S2};">
        <p style="font-size:13px;font-weight:600;color:${B};margin:0;text-transform:uppercase;letter-spacing:0.05em;">Récapitulatif</p>
      </td></tr>
      <tr><td style="padding:20px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="font-size:14px;color:${S5};padding-bottom:12px;">Produit</td><td align="right" style="font-size:14px;color:${S7};font-weight:600;padding-bottom:12px;">Pack ${data.packName}</td></tr>
          <tr><td style="font-size:14px;color:${S5};padding-bottom:12px;">Crédits ajoutés</td><td align="right" style="font-size:14px;color:${S7};font-weight:600;padding-bottom:12px;">${data.creditsAdded} crédits</td></tr>
          <tr><td colspan="2" style="padding-bottom:12px;"><hr style="border:none;border-top:1px solid ${S2};"/></td></tr>
          <tr><td style="font-size:15px;font-weight:700;color:${B};padding-bottom:12px;">Total payé</td><td align="right" style="font-size:18px;font-weight:700;color:${B};padding-bottom:12px;">${data.amount}</td></tr>
          <tr><td colspan="2" style="padding-bottom:8px;"><hr style="border:none;border-top:1px solid ${S2};"/></td></tr>
          <tr><td style="font-size:12px;color:${S4};padding-bottom:6px;">Date</td><td align="right" style="font-size:12px;color:${S4};padding-bottom:6px;">${data.date}</td></tr>
          <tr><td style="font-size:12px;color:${S4};">Réf. transaction</td><td align="right" style="font-size:12px;color:${S4};word-break:break-all;">${data.transactionId}</td></tr>
        </table>
      </td></tr>
    </table>
    ${btn('https://lescordistes.com/jobs', 'Voir les missions disponibles')}
    <hr style="border:none;border-top:1px solid ${S2};margin:28px 0;"/>
    <p style="font-size:13px;color:${S5};margin:0;">Historique d'achats et factures dans votre <a href="https://lescordistes.com/dashboard/credits" style="color:${BL};text-decoration:none;">espace crédits</a>.</p>
  `);
}

function verifyEmail(data: Record<string, string>): string {
  return base('Confirmez votre adresse email — LesCordistes.com', `
    <h1 style="font-size:22px;font-weight:700;color:${B};margin:0 0 8px;line-height:30px;">Confirmez votre adresse email</h1>
    <p style="font-size:15px;color:${S5};margin:0 0 24px;">Bonjour ${data.name || ''},</p>
    <p style="font-size:15px;color:${S7};line-height:24px;margin:0 0 28px;">
      Merci de vous être inscrit sur <strong>LesCordistes.com</strong>. Cliquez ci-dessous pour confirmer votre adresse et activer votre compte.
    </p>
    ${btn(data.verificationUrl, 'Confirmer mon adresse email')}
    <hr style="border:none;border-top:1px solid ${S2};margin:28px 0;"/>
    <p style="font-size:13px;color:${S5};margin:0 0 10px;">Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :</p>
    <p style="font-size:12px;margin:0 0 20px;word-break:break-all;"><a href="${data.verificationUrl}" style="color:${BL};text-decoration:none;">${data.verificationUrl}</a></p>
    <p style="font-size:12px;color:${S4};margin:0;">Si vous n'êtes pas à l'origine de cette inscription, ignorez cet email.</p>
  `);
}

function passwordReset(data: Record<string, string>): string {
  return base('Réinitialisation de votre mot de passe — LesCordistes.com', `
    <h1 style="font-size:22px;font-weight:700;color:${B};margin:0 0 8px;line-height:30px;">Réinitialisation de mot de passe</h1>
    <p style="font-size:15px;color:${S5};margin:0 0 24px;">Bonjour ${data.name || ''},</p>
    <p style="font-size:15px;color:${S7};line-height:24px;margin:0 0 8px;">Vous avez demandé la réinitialisation de votre mot de passe sur <strong>LesCordistes.com</strong>.</p>
    <p style="font-size:15px;color:${S7};line-height:24px;margin:0 0 28px;">Ce lien est valable <strong>1 heure</strong>.</p>
    ${btn(data.resetUrl, 'Choisir un nouveau mot de passe')}
    <hr style="border:none;border-top:1px solid ${S2};margin:28px 0;"/>
    <p style="font-size:13px;color:${S5};margin:0 0 10px;">Si le bouton ne fonctionne pas :</p>
    <p style="font-size:12px;margin:0 0 20px;word-break:break-all;"><a href="${data.resetUrl}" style="color:${BL};text-decoration:none;">${data.resetUrl}</a></p>
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:6px;padding:14px 18px;">
      <p style="font-size:13px;color:#991b1b;margin:0;line-height:20px;">
        <strong>Ce n'est pas vous ?</strong> Ignorez cet email. Votre mot de passe reste inchangé.
      </p>
    </div>
  `);
}

function guestJobCreated(data: Record<string, string>): string {
  const name = data.name || 'Client';
  const title = data.title || 'votre mission';
  const city = data.city ? ` à ${data.city}` : '';
  return base(`Votre demande a bien été reçue — LesCordistes.com`, `
    <h1 style="font-size:22px;font-weight:700;color:${B};margin:0 0 8px;line-height:30px;">Votre demande a bien été reçue</h1>
    <p style="font-size:15px;color:${S5};margin:0 0 24px;">Bonjour ${name},</p>
    <p style="font-size:15px;color:${S7};line-height:24px;margin:0 0 28px;">
      Nous avons bien reçu votre demande pour <strong>${title}${city}</strong>. Elle est en cours d'examen et sera visible par les cordistes de votre région sous 24h.
    </p>
    <div style="background:${S1};border-radius:8px;padding:24px;margin:0 0 28px;">
      <p style="font-size:13px;font-weight:600;color:${B};margin:0 0 16px;text-transform:uppercase;letter-spacing:0.05em;">Et maintenant ?</p>
      <p style="font-size:14px;color:${S7};margin:0 0 10px;line-height:20px;"><span style="color:${BL};font-weight:700;">1.</span> Votre annonce est examinée par notre équipe</p>
      <p style="font-size:14px;color:${S7};margin:0 0 10px;line-height:20px;"><span style="color:${BL};font-weight:700;">2.</span> Les cordistes qualifiés de votre secteur peuvent vous contacter</p>
      <p style="font-size:14px;color:${S7};margin:0;line-height:20px;"><span style="color:${BL};font-weight:700;">3.</span> Vous recevrez les devis directement par email et téléphone</p>
    </div>
    ${btn('https://www.lescordistes.com/post-job', 'Suivre ma demande')}
    <hr style="border:none;border-top:1px solid ${S2};margin:28px 0;"/>
    <p style="font-size:13px;color:${S5};margin:0;line-height:20px;">Une question ? Répondez directement à cet email, notre équipe vous répond sous 24h.</p>
  `);
}

function escHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function adminCustom(data: Record<string, string>): string {
  const name = escHtml(data.name || '');
  const subject = escHtml(data.subject || 'Message de LesCordistes.com');
  const rawBody = data.body || '';
  // Corps en texte brut — échappé puis reconverti en paragraphes.
  const escaped = escHtml(rawBody);
  const paragraphs = escaped
    .split(/\n{2,}/)
    .map(p => p.replace(/\n/g, '<br/>').trim())
    .filter(Boolean)
    .map(p => `<p style="font-size:15px;color:${S7};line-height:24px;margin:0 0 18px;">${p}</p>`)
    .join('');
  // CTA : href limité à http(s), textes échappés. Si le link n'est pas valide → pas de CTA.
  const rawLink = (data.link || '').trim();
  const safeLink = /^https?:\/\/[^\s"'<>]+$/i.test(rawLink) ? rawLink : '';
  const cta = safeLink && data.linkText ? btn(escHtml(safeLink), escHtml(data.linkText)) : '';
  return base(subject, `
    ${name ? `<p style="font-size:15px;color:${S5};margin:0 0 18px;">Bonjour ${name},</p>` : ''}
    ${paragraphs || `<p style="font-size:15px;color:${S7};line-height:24px;margin:0 0 18px;">(message vide)</p>`}
    ${cta}
    <hr style="border:none;border-top:1px solid ${S2};margin:28px 0;"/>
    <p style="font-size:13px;color:${S5};margin:0;">Une question ? Répondez directement à cet email.</p>
  `);
}

// ─── Router ───────────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { to, subject, templateId, data } = await req.json();

    let html = '';

    switch (templateId) {
      case 'welcome-client':   html = welcomeClient(data); break;
      case 'welcome-pro':      html = welcomePro(data); break;
      case 'admin-alert':      html = adminAlert(data); break;
      case 'job-status':       html = jobStatus(data); break;
      case 'match-job':        html = matchJob(data); break;
      case 'payment-receipt':  html = paymentReceipt(data); break;
      case 'verify-email':     html = verifyEmail(data); break;
      case 'password-reset':   html = passwordReset(data); break;
      case 'guest-job-created': html = guestJobCreated(data); break;
      case 'admin-custom':     html = adminCustom(data); break;
      default:
        throw new Error(`Template not found: ${templateId}`);
    }

    const { data: resendData, error } = await resend.emails.send({
      from: 'LesCordistes <contact@lescordistes.com>',
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });

    if (error) {
      console.error('Resend Error:', error);
      return new Response(JSON.stringify({ error }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(resendData), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Function Error:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
