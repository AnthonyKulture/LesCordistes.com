import * as React from 'npm:react@19.2.0';
import {
  Section,
  Text,
  Heading,
  Button,
} from 'npm:@react-email/components@0.0.34';
import { BaseLayout } from './BaseLayout.tsx';

interface WelcomeClientEmailProps {
  name: string;
}

const brandBlue = '#0f172a';
const brandOrange = '#f97316';

export const WelcomeClientEmail = ({ name }: WelcomeClientEmailProps) => (
  <BaseLayout previewText="Bienvenue sur LesCordistes.com !">
    <Section>
      <Heading style={{ fontSize: '24px', fontWeight: 'bold' }}>
        Bonjour {name},
      </Heading>
      <Text style={{ fontSize: '16px', lineHeight: '24px' }}>
        Nous sommes ravis de vous accueillir sur <strong>LesCordistes.com</strong>, le réseau n°1 pour trouver des techniciens qualifiés en travaux sur cordes.
      </Text>
      <Text style={{ fontSize: '16px', lineHeight: '24px' }}>
        Que vous soyez un particulier, un syndic ou une entreprise du BTP, notre plateforme vous met en relation avec les meilleurs pros du secteur pour vos interventions en hauteur.
      </Text>
      <Section style={{ padding: '24px 0' }}>
        <Button
          href="https://lescordistes.com/post-job"
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
          Déposer ma première mission
        </Button>
      </Section>
      <Text style={{ fontSize: '14px', color: '#666' }}>
        Une question ? Répondez simplement à cet email, notre équipe est là pour vous aider !
      </Text>
    </Section>
  </BaseLayout>
);
