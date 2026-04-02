import * as React from 'npm:react@18.3.1';
import { Section, Text, Heading, Button, Hr } from 'npm:@react-email/components@0.0.34';
import { BaseLayout } from './BaseLayout.tsx';

interface AdminAlertEmailProps {
  title: string;
  message: string;
  link: string;
  linkText: string;
}

const brandBlue = '#243355';
const brandBlueLight = '#5B8DDB';
const slate700 = '#334155';
const slate500 = '#64748b';

export const AdminAlertEmail = ({ title, message, link, linkText }: AdminAlertEmailProps) => (
  <BaseLayout previewText={`Action requise — ${title}`}>

    <Section style={{
      backgroundColor: '#eff6ff',
      borderLeft: `4px solid ${brandBlueLight}`,
      borderRadius: '0 6px 6px 0',
      padding: '14px 18px',
      margin: '0 0 28px',
    }}>
      <Text style={{ fontSize: '12px', fontWeight: '600', color: brandBlueLight, margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Notification Admin
      </Text>
      <Text style={{ fontSize: '14px', fontWeight: '600', color: brandBlue, margin: '0' }}>
        {title}
      </Text>
    </Section>

    <Text style={{ fontSize: '15px', color: slate700, lineHeight: '24px', margin: '0 0 28px' }}>
      {message}
    </Text>

    <Button
      href={link}
      style={{
        backgroundColor: brandBlue,
        borderRadius: '6px',
        color: '#ffffff',
        fontSize: '15px',
        fontWeight: '600',
        textDecoration: 'none',
        textAlign: 'center' as const,
        display: 'block',
        padding: '14px 24px',
      }}
    >
      {linkText}
    </Button>

    <Hr style={{ borderColor: '#e2e8f0', margin: '28px 0' }} />

    <Text style={{ fontSize: '13px', color: slate500, margin: '0', lineHeight: '20px' }}>
      Cet email a été envoyé automatiquement par le système LesCordistes.com.
    </Text>

  </BaseLayout>
);
