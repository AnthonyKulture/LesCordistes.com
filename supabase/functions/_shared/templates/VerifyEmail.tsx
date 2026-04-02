import * as React from 'npm:react@19.2.0';
import {
  Section,
  Text,
  Heading,
  Button,
  Link,
} from 'npm:@react-email/components@0.0.34';
import { BaseLayout } from './BaseLayout.tsx';

interface VerifyEmailProps {
  name: string;
  verificationUrl: string;
}

const brandBlue = '#0f172a';
const brandOrange = '#f97316';

export const VerifyEmail = ({ name, verificationUrl }: VerifyEmailProps) => (
  <BaseLayout previewText="Confirmez votre adresse email - LesCordistes.com">
    <Section>
      <Heading style={{ fontSize: '24px', fontWeight: 'bold' }}>
        📧 Confirmation de votre compte
      </Heading>
      <Text style={{ fontSize: '16px', lineHeight: '24px' }}>
        Bonjour {name || 'sur LesCordistes.com'},
      </Text>
      <Text style={{ fontSize: '16px', lineHeight: '24px' }}>
        Merci de vous être inscrit sur <strong>LesCordistes.com</strong>. Pour finaliser la création de votre compte et accéder à toutes nos fonctionnalités, merci de confirmer votre adresse email en cliquant sur le bouton ci-dessous :
      </Text>
      <Section style={{ padding: '24px 0' }}>
        <Button
          href={verificationUrl}
          style={{
            backgroundColor: brandOrange,
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
          Confirmer mon adresse email
        </Button>
      </Section>
      <Text style={{ fontSize: '14px', color: '#666' }}>
        Si le bouton ne fonctionne pas, vous pouvez copier et coller ce lien dans votre navigateur :<br />
        <Link href={verificationUrl} style={{ color: brandBlue, wordBreak: 'break-all' }}>{verificationUrl}</Link>
      </Text>
      <Text style={{ fontSize: '14px', color: '#999', marginTop: '24px' }}>
        Si vous n'avez pas créé de compte sur LesCordistes.com, vous pouvez ignorer cet email en toute sécurité.
      </Text>
    </Section>
  </BaseLayout>
);
