import * as React from 'npm:react@18.3.1';
import { Section, Text, Heading, Button, Hr, Link } from 'npm:@react-email/components@0.0.34';
import { BaseLayout } from './BaseLayout.tsx';

interface VerifyEmailProps {
  name: string;
  verificationUrl: string;
}

const brandBlue = '#243355';
const brandBlueLight = '#5B8DDB';
const slate700 = '#334155';
const slate500 = '#64748b';

export const VerifyEmail = ({ name, verificationUrl }: VerifyEmailProps) => (
  <BaseLayout previewText="Confirmez votre adresse email pour activer votre compte LesCordistes.com">

    <Heading style={{ fontSize: '22px', fontWeight: '700', color: brandBlue, margin: '0 0 8px', lineHeight: '30px' }}>
      Confirmez votre adresse email
    </Heading>
    <Text style={{ fontSize: '15px', color: slate500, margin: '0 0 24px', lineHeight: '22px' }}>
      Bonjour {name || ''},
    </Text>

    <Text style={{ fontSize: '15px', color: slate700, lineHeight: '24px', margin: '0 0 28px' }}>
      Merci de vous être inscrit sur <strong>LesCordistes.com</strong>. Cliquez sur le bouton ci-dessous pour confirmer votre adresse email et activer votre compte.
    </Text>

    <Button
      href={verificationUrl}
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
      Confirmer mon adresse email
    </Button>

    <Hr style={{ borderColor: '#e2e8f0', margin: '28px 0' }} />

    <Text style={{ fontSize: '13px', color: slate500, margin: '0 0 12px', lineHeight: '20px' }}>
      Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :
    </Text>
    <Text style={{ fontSize: '12px', margin: '0 0 20px', lineHeight: '18px' }}>
      <Link href={verificationUrl} style={{ color: brandBlueLight, wordBreak: 'break-all' as const, textDecoration: 'none' }}>
        {verificationUrl}
      </Link>
    </Text>

    <Text style={{ fontSize: '12px', color: '#94a3b8', margin: '0', lineHeight: '18px' }}>
      Si vous n'êtes pas à l'origine de cette inscription, ignorez simplement cet email.
    </Text>

  </BaseLayout>
);
