import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Resend } from 'npm:resend@3.2.0';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const SITE_URL = 'https://lescordistes.com';

// ─── Brand ────────────────────────────────────────────────────────────────────
const B   = '#243355';
const BL  = '#5B8DDB';
const S7  = '#334155';
const S5  = '#64748b';
const S4  = '#94a3b8';
const S2  = '#e2e8f0';
const S1  = '#f1f5f9';

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
<table width="100%" cellpadding="0" cellspacing="0" style="background:${B};">
  <tr><td align="center" style="padding:24px 40px;">
    <a href="${SITE_URL}" style="text-decoration:none;">
      <span style="font-family:Inter,Arial,sans-serif;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">Les<span style="color:${BL};">Cordistes</span><span style="color:#ffffff;opacity:0.6;">.com</span></span>
    </a>
  </td></tr>
</table>
<table width="100%" cellpadding="0" cellspacing="0">
  <tr><td align="center" style="padding:0 16px;">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;max-width:600px;width:100%;padding:40px 40px 48px;">
      <tr><td>${content}</td></tr>
    </table>
  </td></tr>
</table>
<table width="100%" cellpadding="0" cellspacing="0">
  <tr><td align="center" style="padding:24px 40px 40px;">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
      <tr><td>
        <hr style="border:none;border-top:1px solid ${S2};margin:0 0 20px;"/>
        <p style="font-size:12px;color:${S4};text-align:center;margin:0 0 8px;line-height:18px;">
          © 2026 LesCordistes.com — Le réseau n°1 des travaux en hauteur
        </p>
        <p style="font-size:12px;color:${S4};text-align:center;margin:0;line-height:18px;">
          <a href="${SITE_URL}" style="color:${BL};text-decoration:none;">Visiter le site</a>
          &nbsp;·&nbsp;
          <a href="${SITE_URL}/dashboard" style="color:${BL};text-decoration:none;">Mon espace</a>
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

// ─── Templates ────────────────────────────────────────────────────────────────

function verifyEmailHtml(verifyUrl: string): string {
  return base('Confirmez votre adresse email — LesCordistes.com', `
    <h1 style="font-size:22px;font-weight:700;color:${B};margin:0 0 8px;line-height:30px;">Confirmez votre adresse email</h1>
    <p style="font-size:15px;color:${S7};line-height:24px;margin:0 0 28px;">
      Merci de vous être inscrit sur <strong>LesCordistes.com</strong>. Cliquez ci-dessous pour confirmer votre adresse et activer votre compte.
    </p>
    ${btn(verifyUrl, 'Confirmer mon adresse email')}
    <hr style="border:none;border-top:1px solid ${S2};margin:28px 0;"/>
    <p style="font-size:13px;color:${S5};margin:0 0 10px;">Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :</p>
    <p style="font-size:12px;margin:0 0 20px;word-break:break-all;"><a href="${verifyUrl}" style="color:${BL};text-decoration:none;">${verifyUrl}</a></p>
    <p style="font-size:12px;color:${S4};margin:0;">Si vous n'êtes pas à l'origine de cette inscription, ignorez cet email.</p>
  `);
}

function passwordResetHtml(resetUrl: string): string {
  return base('Réinitialisation de votre mot de passe — LesCordistes.com', `
    <h1 style="font-size:22px;font-weight:700;color:${B};margin:0 0 8px;line-height:30px;">Réinitialisation de mot de passe</h1>
    <p style="font-size:15px;color:${S7};line-height:24px;margin:0 0 8px;">Vous avez demandé la réinitialisation de votre mot de passe sur <strong>LesCordistes.com</strong>.</p>
    <p style="font-size:15px;color:${S7};line-height:24px;margin:0 0 28px;">Ce lien est valable <strong>1 heure</strong>.</p>
    ${btn(resetUrl, 'Choisir un nouveau mot de passe')}
    <hr style="border:none;border-top:1px solid ${S2};margin:28px 0;"/>
    <p style="font-size:13px;color:${S5};margin:0 0 10px;">Si le bouton ne fonctionne pas :</p>
    <p style="font-size:12px;margin:0 0 20px;word-break:break-all;"><a href="${resetUrl}" style="color:${BL};text-decoration:none;">${resetUrl}</a></p>
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:6px;padding:14px 18px;">
      <p style="font-size:13px;color:#991b1b;margin:0;line-height:20px;">
        <strong>Ce n'est pas vous ?</strong> Ignorez cet email. Votre mot de passe reste inchangé.
      </p>
    </div>
  `);
}

function magicLinkHtml(loginUrl: string): string {
  return base('Votre lien de connexion — LesCordistes.com', `
    <h1 style="font-size:22px;font-weight:700;color:${B};margin:0 0 8px;line-height:30px;">Votre lien de connexion</h1>
    <p style="font-size:15px;color:${S7};line-height:24px;margin:0 0 28px;">
      Cliquez sur le bouton ci-dessous pour vous connecter à <strong>LesCordistes.com</strong>. Ce lien est à usage unique et expire dans 1 heure.
    </p>
    ${btn(loginUrl, 'Se connecter')}
    <hr style="border:none;border-top:1px solid ${S2};margin:28px 0;"/>
    <p style="font-size:13px;color:${S5};margin:0 0 10px;">Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :</p>
    <p style="font-size:12px;margin:0 0 20px;word-break:break-all;"><a href="${loginUrl}" style="color:${BL};text-decoration:none;">${loginUrl}</a></p>
    <p style="font-size:12px;color:${S4};margin:0;">Si vous n'avez pas demandé ce lien, ignorez cet email.</p>
  `);
}

// ─── Hook handler ─────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' },
    });
  }

  try {
    const body = await req.json();
    console.log('Hook payload:', JSON.stringify(body));

    const user = (body.user ?? {}) as { email: string; id: string };
    const email_data = (body.email_data ?? {}) as {
      token: string;
      token_hash: string;
      email_action_type: string;
      redirect_to: string;
      site_url: string;
    };

    if (!user.email || !email_data.token_hash) {
      console.error('Missing fields:', JSON.stringify({ user, email_data }));
      return new Response(JSON.stringify({}), { status: 200 });
    }

    const { token_hash, email_action_type, redirect_to } = email_data;

    // Build verification URL on lescordistes.com (proxy route)
    const verifyUrl = new URL(`${SITE_URL}/auth/verify`);
    verifyUrl.searchParams.set('token', token_hash);
    verifyUrl.searchParams.set('type', email_action_type);
    if (redirect_to) verifyUrl.searchParams.set('redirect_to', redirect_to);
    const urlStr = verifyUrl.toString();

    let subject: string;
    let html: string;

    if (email_action_type === 'recovery') {
      subject = 'Réinitialisation de votre mot de passe — LesCordistes.com';
      html = passwordResetHtml(urlStr);
    } else if (email_action_type === 'magiclink') {
      subject = 'Votre lien de connexion — LesCordistes.com';
      html = magicLinkHtml(urlStr);
    } else {
      // signup, invite, email_change
      subject = 'Confirmez votre adresse email — LesCordistes.com';
      html = verifyEmailHtml(urlStr);
    }

    const { error } = await resend.emails.send({
      from: 'LesCordistes <no-reply@lescordistes.com>',
      to: [user.email],
      subject,
      html,
    });

    if (error) {
      console.error('Resend error:', JSON.stringify(error));
    }

    return new Response(JSON.stringify({}), { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Hook error:', message);
    // Toujours 200 pour ne pas bloquer le flow auth
    return new Response(JSON.stringify({}), { status: 200 });
  }
});
