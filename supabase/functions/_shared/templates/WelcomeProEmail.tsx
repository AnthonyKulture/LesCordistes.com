import * as React from 'npm:react@19.2.0';
import {
  Section,
  Text,
  Heading,
  Button,
} from 'npm:@react-email/components@0.0.34';
import { BaseLayout } from './BaseLayout.tsx';

interface WelcomeProEmailProps {
  name: string;
}

const brandBlue = '#0f172a';
const brandOrange = '#f97316';

export const WelcomeProEmail = ({ name }: WelcomeProEmailProps) => (
  <BaseLayout previewText="Bienvenue sur LesCordistes.com !">
    <Section>
      <Heading style={{ fontSize: '24px', fontWeight: 'bold' }}>
        🧗 Bonjour {name},
      </Heading>
      <Text style={{ fontSize: '16px', lineHeight: '24px' }}>
        Bienvenue sur <strong>LesCordistes.com</strong>, le réseau n°1 pour trouver des missions de travaux sur cordes.
      </Text>
      <Text style={{ fontSize: '16px', lineHeight: '24px' }}>
        Votre profil professionnel est désormais actif. Vous pouvez dès maintenant consulter les missions disponibles sur le Job Board et débloquer les coordonnées des clients qui vous intéressent.
      </Text>
      <Section style={{ padding: '24px 0' }}>
        <Button
          href="https://lescordistes.com/jobs"
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
          Voir les missions disponibles
        </Button>
      </Section>
      <Text style={{ fontSize: '14px', color: '#666' }}>
        Conseil : Complétez votre profil avec vos certifications et une belle bio pour augmenter vos chances d'être sélectionné par les clients !
      </Text>
    </Section>
  </BaseLayout>
);
