import * as React from 'npm:react@19.2.0';
import {
  Section,
  Text,
  Heading,
  Button,
} from 'npm:@react-email/components@0.0.34';
import { BaseLayout } from './BaseLayout.tsx';

interface NewMessageEmailProps {
  recipientName: string;
  senderName: string;
  messagePreview: string;
  conversationUrl: string;
  jobTitle?: string;
}

const brandBlue = '#0f172a';
const brandOrange = '#f97316';

export const NewMessageEmail = ({
  recipientName,
  senderName,
  messagePreview,
  conversationUrl,
  jobTitle,
}: NewMessageEmailProps) => (
  <BaseLayout previewText={`Nouveau message de ${senderName} sur LesCordistes.com`}>
    <Section>
      <Heading style={{ fontSize: '24px', fontWeight: 'bold' }}>
        Vous avez un nouveau message
      </Heading>
      <Text style={{ fontSize: '16px', lineHeight: '24px' }}>
        Bonjour {recipientName},
      </Text>
      <Text style={{ fontSize: '16px', lineHeight: '24px' }}>
        <strong>{senderName}</strong> vous a envoyé un message{jobTitle ? ` concernant la mission « ${jobTitle} »` : ''}.
      </Text>

      <Section style={{
        backgroundColor: '#f8fafc',
        borderLeft: '4px solid #243355',
        padding: '16px 20px',
        borderRadius: '0 8px 8px 0',
        margin: '20px 0',
      }}>
        <Text style={{ margin: 0, fontSize: '15px', color: '#334155', fontStyle: 'italic', lineHeight: '22px' }}>
          "{messagePreview}"
        </Text>
      </Section>

      <Section style={{ padding: '20px 0' }}>
        <Button
          href={conversationUrl}
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
          Répondre au message
        </Button>
      </Section>

      <Text style={{ fontSize: '13px', color: '#94a3b8', marginTop: '8px' }}>
        Vous recevez cet email car vous n'étiez pas connecté au moment de l'envoi.
      </Text>
    </Section>
  </BaseLayout>
);
