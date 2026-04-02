import * as React from 'npm:react@19.2.0';
import { Section, Text, Heading, Button, Hr, Row, Column } from 'npm:@react-email/components@0.0.34';
import { BaseLayout } from './BaseLayout.tsx';

interface MatchJobEmailProps {
  proName: string;
  jobTitle: string;
  location: string;
  jobId: string;
  isRenfort?: boolean;
}

const brandBlue = '#243355';
const brandBlueLight = '#5B8DDB';
const slate700 = '#334155';
const slate500 = '#64748b';
const slate100 = '#f1f5f9';

export const MatchJobEmail = ({ proName, jobTitle, location, jobId, isRenfort }: MatchJobEmailProps) => (
  <BaseLayout previewText={`Nouvelle mission dans votre zone — ${jobTitle} à ${location}`}>

    {/* Alert badge */}
    <Section style={{
      backgroundColor: '#eff6ff',
      borderLeft: `4px solid ${brandBlueLight}`,
      borderRadius: '0 6px 6px 0',
      padding: '14px 18px',
      margin: '0 0 28px',
    }}>
      <Text style={{ fontSize: '12px', fontWeight: '600', color: brandBlueLight, margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {isRenfort ? 'Mission Renfort PRO' : 'Nouvelle mission'}
      </Text>
      <Text style={{ fontSize: '14px', color: brandBlue, margin: '0', fontWeight: '600' }}>
        Une opportunité dans votre zone d'intervention
      </Text>
    </Section>

    <Heading style={{ fontSize: '22px', fontWeight: '700', color: brandBlue, margin: '0 0 8px', lineHeight: '30px' }}>
      Mission disponible près de chez vous
    </Heading>
    <Text style={{ fontSize: '15px', color: slate500, margin: '0 0 24px', lineHeight: '22px' }}>
      Bonjour {proName},
    </Text>

    <Text style={{ fontSize: '15px', color: slate700, lineHeight: '24px', margin: '0 0 24px' }}>
      Une nouvelle mission{isRenfort ? ' de renfort professionnel' : ''} vient d'être publiée dans votre secteur. Consultez les détails et débloquez les coordonnées du client si elle vous intéresse.
    </Text>

    {/* Job card */}
    <Section style={{ backgroundColor: slate100, borderRadius: '8px', padding: '20px 24px', margin: '0 0 28px' }}>
      <Text style={{ fontSize: '18px', fontWeight: '700', color: brandBlue, margin: '0 0 10px', lineHeight: '26px' }}>
        {jobTitle}
      </Text>
      <Row>
        <Column>
          <Text style={{ fontSize: '14px', color: slate500, margin: '0', lineHeight: '20px' }}>
            <span style={{ color: slate700, fontWeight: '600' }}>Lieu :</span> {location}
          </Text>
        </Column>
      </Row>
    </Section>

    <Button
      href={`https://lescordistes.com/jobs/${jobId}`}
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
      Voir les détails de la mission
    </Button>

    <Hr style={{ borderColor: '#e2e8f0', margin: '28px 0' }} />

    <Text style={{ fontSize: '13px', color: slate500, margin: '0', lineHeight: '20px' }}>
      Les meilleures missions sont souvent débloquées rapidement. Agissez vite pour mettre toutes les chances de votre côté.
    </Text>

  </BaseLayout>
);
