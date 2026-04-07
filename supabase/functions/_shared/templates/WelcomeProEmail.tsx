import * as React from 'npm:react@18.3.1';
import { Section, Text, Heading, Button, Hr, Row, Column } from 'npm:@react-email/components@0.0.34';
import { BaseLayout } from './BaseLayout.tsx';

interface WelcomeProEmailProps {
  name: string;
}

const brandBlue = '#243355';
const brandBlueLight = '#5B8DDB';
const slate700 = '#334155';
const slate500 = '#64748b';
const slate100 = '#f1f5f9';

export const WelcomeProEmail = ({ name }: WelcomeProEmailProps) => (
  <BaseLayout previewText={`Bienvenue sur LesCordistes.com, ${name} — trouvez vos prochaines missions`}>

    <Heading style={{ fontSize: '22px', fontWeight: '700', color: brandBlue, margin: '0 0 8px', lineHeight: '30px' }}>
      Votre profil pro est actif
    </Heading>
    <Text style={{ fontSize: '15px', color: slate500, margin: '0 0 28px', lineHeight: '22px' }}>
      Bonjour {name},
    </Text>

    <Text style={{ fontSize: '15px', color: slate700, lineHeight: '24px', margin: '0 0 28px' }}>
      Bienvenue sur <strong>LesCordistes.com</strong>, le réseau de référence pour les techniciens en travaux sur cordes. Des centaines de missions sont publiées chaque mois par des clients professionnels et particuliers partout en France.
    </Text>

    {/* Steps */}
    <Section style={{ backgroundColor: slate100, borderRadius: '8px', padding: '24px', margin: '0 0 28px' }}>
      <Text style={{ fontSize: '13px', fontWeight: '600', color: brandBlue, margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Maximisez vos chances
      </Text>
      <Row style={{ marginBottom: '12px' }}>
        <Column style={{ width: '28px', verticalAlign: 'top', paddingTop: '1px' }}>
          <Text style={{ fontSize: '13px', fontWeight: '700', color: brandBlueLight, margin: '0' }}>1.</Text>
        </Column>
        <Column>
          <Text style={{ fontSize: '14px', color: slate700, margin: '0', lineHeight: '20px' }}>
            <strong>Complétez votre profil</strong> — certifications IRATA, CQP, photos de réalisations
          </Text>
        </Column>
      </Row>
      <Row style={{ marginBottom: '12px' }}>
        <Column style={{ width: '28px', verticalAlign: 'top', paddingTop: '1px' }}>
          <Text style={{ fontSize: '13px', fontWeight: '700', color: brandBlueLight, margin: '0' }}>2.</Text>
        </Column>
        <Column>
          <Text style={{ fontSize: '14px', color: slate700, margin: '0', lineHeight: '20px' }}>
            <strong>Renseignez vos zones d'intervention</strong> — recevez des alertes missions ciblées
          </Text>
        </Column>
      </Row>
      <Row>
        <Column style={{ width: '28px', verticalAlign: 'top', paddingTop: '1px' }}>
          <Text style={{ fontSize: '13px', fontWeight: '700', color: brandBlueLight, margin: '0' }}>3.</Text>
        </Column>
        <Column>
          <Text style={{ fontSize: '14px', color: slate700, margin: '0', lineHeight: '20px' }}>
            <strong>Débloquez les leads qui vous intéressent</strong> — contactez les clients directement
          </Text>
        </Column>
      </Row>
    </Section>

    <Button
      href="https://lescordistes.com/dashboard/pro"
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
      Compléter mon profil
    </Button>

    <Hr style={{ borderColor: '#e2e8f0', margin: '28px 0' }} />

    <Text style={{ fontSize: '13px', color: slate500, margin: '0', lineHeight: '20px' }}>
      Les profils complets reçoivent en moyenne 3x plus de contacts clients. Prenez 5 minutes pour renseigner vos informations.
    </Text>

  </BaseLayout>
);
