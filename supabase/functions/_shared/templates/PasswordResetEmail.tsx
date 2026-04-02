import * as React from 'npm:react@18.3.1';
import { Section, Text, Heading, Button, Hr, Link } from 'npm:@react-email/components@0.0.34';
import { BaseLayout } from './BaseLayout.tsx';

interface PasswordResetEmailProps {
  name: string;
  resetUrl: string;
}

const brandBlue = '#243355';
const brandBlueLight = '#5B8DDB';
const slate700 = '#334155';
const slate500 = '#64748b';

export const PasswordResetEmail = ({ name, resetUrl }: PasswordResetEmailProps) => (
  <BaseLayout previewText="Réinitialisation de votre mot de passe LesCordistes.com">

    <Heading style={{ fontSize: '22px', fontWeight: '700', color: brandBlue, margin: '0 0 8px', lineHeight: '30px' }}>
      Réinitialisation de mot de passe
    </Heading>
    <Text style={{ fontSize: '15px', color: slate500, margin: '0 0 24px', lineHeight: '22px' }}>
      Bonjour {name || ''},
    </Text>

    <Text style={{ fontSize: '15px', color: slate700, lineHeight: '24px', margin: '0 0 8px' }}>
      Vous avez demandé la réinitialisation de votre mot de passe sur <strong>LesCordistes.com</strong>.
    </Text>
    <Text style={{ fontSize: '15px', color: slate700, lineHeight: '24px', margin: '0 0 28px' }}>
      Ce lien est valable <strong>1 heure</strong>. Passé ce délai, vous devrez faire une nouvelle demande.
    </Text>

    <Button
      href={resetUrl}
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
      Choisir un nouveau mot de passe
    </Button>

    <Hr style={{ borderColor: '#e2e8f0', margin: '28px 0' }} />

    <Text style={{ fontSize: '13px', color: slate500, margin: '0 0 12px', lineHeight: '20px' }}>
      Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :
    </Text>
    <Text style={{ fontSize: '12px', margin: '0 0 20px', lineHeight: '18px' }}>
      <Link href={resetUrl} style={{ color: brandBlueLight, wordBreak: 'break-all' as const, textDecoration: 'none' }}>
        {resetUrl}
      </Link>
    </Text>

    <Section style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '14px 18px', margin: '0' }}>
      <Text style={{ fontSize: '13px', color: '#991b1b', margin: '0', lineHeight: '20px' }}>
        <strong>Ce n'est pas vous ?</strong> Ignorez cet email. Votre mot de passe reste inchangé. Si vous recevez plusieurs demandes non sollicitées, contactez-nous à{' '}
        <Link href="mailto:contact@lescordistes.com" style={{ color: '#991b1b' }}>contact@lescordistes.com</Link>.
      </Text>
    </Section>

  </BaseLayout>
);
