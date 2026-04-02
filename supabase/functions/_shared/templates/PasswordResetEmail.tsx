import * as React from 'npm:react@19.2.0';
import {
  Section,
  Text,
  Heading,
  Button,
  Link,
} from 'npm:@react-email/components@0.0.34';
import { BaseLayout } from './BaseLayout.tsx';

interface PasswordResetEmailProps {
  name: string;
  resetUrl: string;
}

const brandBlue = '#0f172a';
const brandOrange = '#f97316';

export const PasswordResetEmail = ({ name, resetUrl }: PasswordResetEmailProps) => (
  <BaseLayout previewText="Réinitialisation de votre mot de passe - LesCordistes.com">
    <Section>
      <Heading style={{ fontSize: '24px', fontWeight: 'bold' }}>
        🔑 Réinitialisation de mot de passe
      </Heading>
      <Text style={{ fontSize: '16px', lineHeight: '24px' }}>
        Bonjour {name || 'sur LesCordistes.com'},
      </Text>
      <Text style={{ fontSize: '16px', lineHeight: '24px' }}>
        Vous avez demandé la réinitialisation de votre mot de passe sur <strong>LesCordistes.com</strong>. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe :
      </Text>
      <Section style={{ padding: '24px 0' }}>
        <Button
          href={resetUrl}
          style={{
            backgroundColor: brandBlue,
            borderRadius: '6px',
            color: '#fff',
            fontSize: '16px',
            fontWeight: 'bold',
            textDecoration: 'none',
            textAlign: 'center' as const,
            display: 'block',
            padding: '12px 24px',
          }}
        >
          Réinitialiser mon mot de passe
        </Button>
      </Section>
      <Text style={{ fontSize: '14px', color: '#666' }}>
        Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email. Votre mot de passe restera inchangé.
      </Text>
      <Text style={{ fontSize: '14px', color: '#666', marginTop: '16px' }}>
        Lien direct : <Link href={resetUrl} style={{ color: brandBlue }}>{resetUrl}</Link>
      </Text>
    </Section>
  </BaseLayout>
);
