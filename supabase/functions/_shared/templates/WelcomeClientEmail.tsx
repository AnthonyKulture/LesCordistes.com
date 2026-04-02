import * as React from 'npm:react@19.2.0';
import { Section, Text, Heading, Button, Hr, Row, Column } from 'npm:@react-email/components@0.0.34';
import { BaseLayout } from './BaseLayout.tsx';

interface WelcomeClientEmailProps {
  name: string;
}

const brandBlue = '#243355';
const brandBlueLight = '#5B8DDB';
const slate700 = '#334155';
const slate500 = '#64748b';
const slate100 = '#f1f5f9';

export const WelcomeClientEmail = ({ name }: WelcomeClientEmailProps) => (
  <BaseLayout previewText={`Bienvenue sur LesCordistes.com, ${name} — votre compte est prêt`}>

    <Heading style={{ fontSize: '22px', fontWeight: '700', color: brandBlue, margin: '0 0 8px', lineHeight: '30px' }}>
      Bienvenue sur LesCordistes.com
    </Heading>
    <Text style={{ fontSize: '15px', color: slate500, margin: '0 0 28px', lineHeight: '22px' }}>
      Bonjour {name},
    </Text>

    <Text style={{ fontSize: '15px', color: slate700, lineHeight: '24px', margin: '0 0 28px' }}>
      Votre compte client est actif. Vous pouvez dès maintenant publier vos chantiers et recevoir des devis de professionnels qualifiés en travaux sur cordes partout en France.
    </Text>

    {/* Steps */}
    <Section style={{ backgroundColor: slate100, borderRadius: '8px', padding: '24px', margin: '0 0 28px' }}>
      <Text style={{ fontSize: '13px', fontWeight: '600', color: brandBlue, margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Comment ça marche
      </Text>
      <Row style={{ marginBottom: '12px' }}>
        <Column style={{ width: '28px', verticalAlign: 'top', paddingTop: '1px' }}>
          <Text style={{ fontSize: '13px', fontWeight: '700', color: brandBlueLight, margin: '0' }}>1.</Text>
        </Column>
        <Column>
          <Text style={{ fontSize: '14px', color: slate700, margin: '0', lineHeight: '20px' }}>
            <strong>Décrivez votre projet</strong> — localisation, type de travaux, délai
          </Text>
        </Column>
      </Row>
      <Row style={{ marginBottom: '12px' }}>
        <Column style={{ width: '28px', verticalAlign: 'top', paddingTop: '1px' }}>
          <Text style={{ fontSize: '13px', fontWeight: '700', color: brandBlueLight, margin: '0' }}>2.</Text>
        </Column>
        <Column>
          <Text style={{ fontSize: '14px', color: slate700, margin: '0', lineHeight: '20px' }}>
            <strong>Les pros vous contactent</strong> — cordistes certifiés de votre secteur
          </Text>
        </Column>
      </Row>
      <Row>
        <Column style={{ width: '28px', verticalAlign: 'top', paddingTop: '1px' }}>
          <Text style={{ fontSize: '13px', fontWeight: '700', color: brandBlueLight, margin: '0' }}>3.</Text>
        </Column>
        <Column>
          <Text style={{ fontSize: '14px', color: slate700, margin: '0', lineHeight: '20px' }}>
            <strong>Choisissez le meilleur profil</strong> — comparez, échangez, décidez
          </Text>
        </Column>
      </Row>
    </Section>

    <Button
      href="https://lescordistes.com/post-job"
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
      Publier mon premier projet
    </Button>

    <Hr style={{ borderColor: '#e2e8f0', margin: '28px 0' }} />

    <Text style={{ fontSize: '13px', color: slate500, margin: '0', lineHeight: '20px' }}>
      Une question ? Répondez directement à cet email, notre équipe vous répond sous 24h.
    </Text>

  </BaseLayout>
);
