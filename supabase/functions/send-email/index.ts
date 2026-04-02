import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Resend } from 'npm:resend@3.2.0';
import { render } from 'npm:@react-email/render@0.0.17';
import * as React from 'npm:react@19.2.0';

// Import templates
import { WelcomeClientEmail } from '../_shared/templates/WelcomeClientEmail.tsx';
import { WelcomeProEmail } from '../_shared/templates/WelcomeProEmail.tsx';
import { AdminAlertEmail } from '../_shared/templates/AdminAlertEmail.tsx';
import { JobStatusEmail } from '../_shared/templates/JobStatusEmail.tsx';
import { PaymentReceiptEmail } from '../_shared/templates/PaymentReceiptEmail.tsx';
import { VerifyEmail } from '../_shared/templates/VerifyEmail.tsx';
import { MatchJobEmail } from '../_shared/templates/MatchJobEmail.tsx';
import { PasswordResetEmail } from '../_shared/templates/PasswordResetEmail.tsx';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { to, subject, templateId, data } = await req.json();

    let emailHtml = '';
    let emailComponent: React.ReactElement | null = null;

    // Template selection logic
    switch (templateId) {
      case 'welcome-client':
        emailComponent = React.createElement(WelcomeClientEmail, { name: data.name });
        break;
      case 'welcome-pro':
        emailComponent = React.createElement(WelcomeProEmail, { name: data.name });
        break;
      case 'admin-alert':
        emailComponent = React.createElement(AdminAlertEmail, { 
          title: data.title, 
          message: data.message, 
          link: data.link, 
          linkText: data.linkText 
        });
        break;
      case 'job-status':
        emailComponent = React.createElement(JobStatusEmail, {
          name: data.name,
          jobTitle: data.jobTitle,
          status: data.status,
          rejectionReason: data.rejectionReason
        });
        break;
      case 'payment-receipt':
        emailComponent = React.createElement(PaymentReceiptEmail, {
          name: data.name,
          packName: data.packName,
          amount: data.amount,
          creditsAdded: data.creditsAdded,
          date: data.date,
          transactionId: data.transactionId
        });
        break;
      case 'verify-email':
        emailComponent = React.createElement(VerifyEmail, {
          name: data.name,
          verificationUrl: data.verificationUrl
        });
        break;
      case 'match-job':
        emailComponent = React.createElement(MatchJobEmail, {
          proName: data.proName,
          jobTitle: data.jobTitle,
          location: data.location,
          jobId: data.jobId,
          isRenfort: data.isRenfort
        });
        break;
      case 'password-reset':
        emailComponent = React.createElement(PasswordResetEmail, {
          name: data.name,
          resetUrl: data.resetUrl
        });
        break;
      default:
        throw new Error(`Template not found: ${templateId}`);
    }

    if (emailComponent) {
      emailHtml = await render(emailComponent);
    }

    const { data: resendData, error } = await resend.emails.send({
      from: 'LesCordistes <no-reply@lescordistes.com>',
      to: Array.isArray(to) ? to : [to],
      subject: subject,
      html: emailHtml,
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
  } catch (error: any) {
    console.error('Function Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
